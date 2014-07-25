/*
 ダイアログを出してデータを選択するシステム
 　　　必要ライブラリ
 jQuery
 jQueryUI

使い方
 1./app/controllers/dialog_input_controller.rb をプロジェクトに追加: ajaxのサーバー側の処理をします
 2./app/views/dialog_input/select.jx.erb,selected.js.erb をプロジェクトに追加: ajaxのサーバー側(javascriptの部分の実行)
 3.レイアウトもしくはビューに以下を追加
    //dialoginputを呼び出すようにする
    <script xmlns="http://www.w3.org/1999/html">
        $(function() {
            $('dialoginput_g').dialoginput();
        });
    </script>

    //dialoginputないで使うdiv をセット。
    <div id="selected_dialog">
        <div id="select_search"></div>
        <div id="select_table"></div>
    </div>
    <div id="alarm_dialog" >
        <div id="alarm_text" ></div>
    </div>
 4./app/assets/javascripts/dialog_input.jsをプロジェクトに追加　java scriptの処理　ダイアログ上でのjavascriptの処理をしています。
 5./config/locales/routes.rbに以下を追加
 　　　  get "dialog_input/select"
        get "dialog_input/selected"
 6.view内に設定ファイルの追加

 view内にセットする属性情報
 <input type=""
 class = "dialoginput dialoginput_g",//dialoginput:F3で検索ダイアログを表示する場合にセット
                                        //dialoginput_g:検索結果に伴って、データをjavascript経由でデータをセットする必要が有る場合にセット
 data-field = "code", //このテキストボックスが対応しているフィールド名
 data-group = "1",//グループID 同じグループは同じ文字列にする必要がある。
 data-diid = "1",//ユニークな文字列にする必要がある。ダイアログから戻った時のフォーカスの位置をセットする時に使っています
 data-id   = "dialoginput_1">//検索に必要な情報が入っているid(#は入れません）


 <span id="dialoginput_1"
 data-sql="select code,name,furi,phone,tax_kbn,kei,sime,addr1 from tmas" //ダイアログに表示する為のsql(最後には";"をつけない)
                                                                         //全て文字としてselectする必要がある。idなどは数値なので
                                                                         //trim(to_char(id,'99999')) as idなどとする
 data-sqlwhere="code like '%@@%'" //検索条件を手動で入れる場合。@@は検索文字列に置き換えられます。
 data-table="Tmas" //sqlのfromで使っているモデルクラス名
 data-idfield="code" //プライマリーキー。複合キーの場合はdata-sqlでこのキーがプリマリーキーになるように抽出している必要がある
 data-fields="code name furi",//全てのフィールド名をスペースで区切って代入
 data-fielddisps="コード 名称 フリガナ", //data-fieldsに対応する日本語文字列をスペース区切りで入力
 ></div>


        他の入力データを参照する場合　以下のように@@囲む。内部的にはdata-diidの中で@@で囲まれた文字列を探しに行って、その値をセットするようにしています。
        "data-sql" => "select ecode,name from tmei where tcode = '@200@'"
 　
 view内にセットする属性情報(ダイアログで選択した結果を反映させるだけの場合)
 <input
 class = "dialoginput_g",//dialoginput_g:検索結果に伴って、データをjavascript経由でデータをセットする必要が有る場合にセット
 data-field = "name", //このテキストボックスが対応しているフィールド名
 data-group = "1",   //グループID 同じグループは同じ文字列にする必要がある。
 "readonly" = "readonly"

 例：
     <%= text_field_tag( 'post[title]',"",
     {:class => "dialoginput dialoginput_g",
     "data-field" => "ecode",
     "data-group" => "3",
     "data-diid" => "3",
     "data-id" => "dialoginput_3"

     }) %>
     <span id="dialoginput_3"
     data-sql="select ecode,name from tmei where tcode = '@200@'"
     data-sqlwhere=""
     data-table="Tmei"
     data-idfield="ecode"
     data-fields="ecode name"
     data-fielddisps="コード 名称"></div>
     <%= text_field_tag( 'post[title2]',"",
     {:class => "dialoginput_g",
     "data-field" => "name",
     "data-group" => "3",
     :readonly => :readonly}) %>



  通常の使い方
 $(function() {
    $('dialoginput_g').dialoginput('');　　　
 });
 */


      (function($) {
          //$.fn.dialoginput=function(config){
          $.fn.extend({
              dialoginput: function(config){
              var action = config;
              function opendialog(thisobj){
                  var idh = new Object();
                  $(".dialoginput[data-diid]").each(function(){
                      idh[$(this).attr("data-diid")] = $(this).val();
                  })
                  selected = thisobj;
                  $('#select_table').html("<blink>読み込み中</blink>");
                  $('#selected_dialog').dialog('open');

                  var sqlid = thisobj.attr("data-id");
                  var sql = $("#" + sqlid).attr("data-sql");
                  var sqlwhere = $("#" + sqlid).attr("data-sqlwhere");
                  var hit = sql.match(/@.*@/);
                  if(hit != null){
                      var diid = hit[0].substring(1,hit[0].length - 1);
                      sql = sql.replace(hit,idh[diid]);
                  }
                  var table =  $("#" + sqlid).attr("data-table");
                  var idfield = $("#" + sqlid).attr("data-idfield");
                  var fields = $("#" + sqlid).attr("data-fields");
                  var fieldsdisps = $("#" + sqlid).attr("data-fielddisps");
                  var field = thisobj.attr("data-field");
                  var group = thisobj.attr("data-group");
                  var diid    = thisobj.attr("data-diid");
                  var search_text = thisobj.val();
                  if(search_text == '') {
                      search_text = $("#" + sqlid + "_data").val();
                  }
                  if(search_text === undefined){search_text = "";}

                  var dpath =  thisobj.attr("data-dpath");
                  var edialog = thisobj.attr("data-edialog");

                  if(sqlwhere === undefined){sqlwhere = "";}

                  $.ajax({
                      type:"GET",
                      url:   dpath + "dialog_input/select",
                      data: encodeURI("table=" + table +
                          "&sql=" + sql +
                          "&sqlwhere=" + sqlwhere +
                          "&fields=" + fields +
                          "&fielddisps=" + fieldsdisps +
                          "&field=" + field +
                          "&idfield=" + idfield +
                          "&group=" + group +
                          "&dpath=" + dpath +
                          "&diid=" + diid +
                          "&edialog=" + edialog +
                          "&search_text=" + search_text),
                      success:function(msg){}
                  });
                  return true;
              }

              $('button.dialoginput').click(function(){
                  opendialog($(this));
                  return false;
              });

              $('.dialoginput').keydown(function(e){

                  if(e.keyCode == 114) //F3
                  {
                      opendialog($(this));
                      return false;

                  }


                  //直接入力する場合の処理
                  //if(e.keyCode == 13  ){//enter
                  if(e.keyCode == 9 || e.keyCode == 13){//enter 　or tab

                      var idh = new Object();
                      $(".dialoginput[data-diid]").each(function(){
                          idh[$(this).attr("data-diid")] = $(this).val();
                      })
                      var sqlid = $(this).attr("data-id");
                      var sql = $("#" + sqlid).attr('data-sql');
                      var sqlwhere = $("#" + sqlid).attr("data-sqlwhere");
                      var table = $("#" + sqlid).attr('data-table');
                      var idfield = $("#" + sqlid).attr('data-idfield');
                      var fields = $("#" + sqlid).attr("data-fields");

                      var id = $(this).val();
                      var group = $(this).attr('data-group');
                      var dpath = $(this).attr('data-dpath');
                      var diid    = $(this).attr("data-diid");
                      var keta    = parseInt($(this).attr("data-keta"));
                      var cut     = parseInt($(this).attr("data-cut"));
                      var change  = $(this).attr("data-change");
                      var edialog = $(this).attr("data-edialog");

                      //8の場合特別処理
                      if(keta == 8){
                          if( id.length == 13){
                              id = id.slice(0,-3);
                              id = id.slice(-1 * keta);
                              $(this).val(id);
                          }
                      } else{
                          if(cut != null && cut != 0 && change == "true")
                          {
                             id =   id.slice(0,cut);
                             $(this).val(id);
                          }
                          if(keta != null && keta != 0 && change == "true")
                          {
                                  var zero ="";
                                  for(i=0;i < keta;i++){
                                      zero = zero + "0";
                                  }
                                  id = (zero + id).slice(-1 * keta);
                                  $(this).val(id);

                          }
                      }


                      $.ajax({
                          type:"GET",
                          url:dpath + "dialog_input/selected",
                          data:"table=" + table +
                              "&sql=" + sql +
                              "&sqlwhere=" + sqlwhere +
                              "&idfield=" + idfield +
                              "&id=" + id +
                              "&group=" + group +
                              "&edialog=" + edialog +
                              "&dpath=" + dpath +
                              "&diid=" + diid +
                              "&fields=" + fields,
                          success:function(msg){}
                      });
                      if(e.keyCode == 13){
                        e.preventDefault();
                      }
                      //return false;

                  }

                  return true;
              });


              function send_dialog_search_text(){

                  var search_text = $('#dialog_search_text').val();
                  var dpath = $('#dialog_search_text').attr('data-dpath');
                  $.ajax({
                      type:"GET",
                      url: dpath + "dialog_input/select",
                      //data:"data1=John&data2=Boston",
                      data:encodeURI("search_text=" + search_text),
                      success:function(msg){}
                  });
              }

              $(document).on("click",'#dialog_search_submit',function(){

                  send_dialog_search_text();
              });


              $(document).on("keydown",'#dialog_search_text',function(e){
                  if(e.keyCode == 13){ //enter key

                      send_dialog_search_text();

                  }
              });
              $(document).on("click",'.dialog_itme',function(e){
                  var table = $(this).attr('data-table')
                  var idfield = $(this).attr('data-idfield');
                  var id = $(this).attr('data-id');
                  var group = $(this).attr('data-group');
                  var dpath = $(this).attr('data-dpath');
                  var edialog = $(this).attr("data-edialog");

                  $('#selected_dialog').dialog('close');

                  $.ajax({
                      type:"GET",
                      url: dpath + "dialog_input/selected",
                      data:encodeURI("table=" + table +  "&idfield=" + idfield + "&id=" + id + "&group=" + group + "&dpath=" + dpath),
                      success:function(msg){}
                  });
                  return true;
              });


              $(document).on('mouseenter','.dialog_line',function(){
                  // マウスが乗ったとき
                  $(this).toggleClass("dialog_highlight");
              });
              $(document).on('mouseleave','.dialog_line',function(){
                  // マウスが乗ったとき
                  $(this).toggleClass("dialog_highlight");
              });



              $('#selected_dialog').dialog({
                  autoOpen: false,
                  title: '選択してください',
                  closeOnEscape: false,
                  width: "auto",
                  //height: 500,
                  maxHeight: 500,
                  modal: true /*,
                   buttons: {
                   '閉じる': function(){
                   $(this).dialog('close');
                   }
                   }*/
              });
              $('#alarm_dialog').dialog({
                  autoOpen: false,
                  title: 'waring',
                  closeOnEscape: false,
                  width:300,
                  height:200,
                  modal: true ,
                  buttons: {
                      'close': function(){
                          var diid =$(this).attr('data-diid');
                          $('.dialoginput_g[data-diid=' + diid + ']').focus();
                          $(this).dialog('close');
                      }
                  }
              });
              }
          });
          //};
      })(jQuery);