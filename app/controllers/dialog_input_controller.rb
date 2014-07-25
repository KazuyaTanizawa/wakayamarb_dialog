class DialogInputController < ApplicationController
  def select

    fields = flashItem("default",params[:fields],"fields")
    fielddisps = flashItem("default",params[:fielddisps],"fieldsdisp")
    table = flashItem("table",params[:table],"table")
    search_text = flashItem("",params[:search_text],"search_text")
    field = flashItem("default",params[:field],"field")
    idfield = flashItem("default",params[:idfield],"idfield")
    group = flashItem("default",params[:group],"group")
    dpath = flashItem("default",params[:dpath],"dpath")
    diid = flashItem("default",params[:diid],"diid")
    fields = fields.split()
    fielddisps = fielddisps.split()
    sql = flashItem("default",params[:sql],"sql")
    sqlwhere = flashItem("defalut",params[:sqlwhere],"sqlwhere")

    if search_text == "" then
      selecteddata = Object.const_get(table).find_by_sql("#{sql} limit 1000;")
    else
      strfields = fields.join(",")
   #   fields.delete("id")
      strwhere = fields.join(" like '%#{search_text}%' or ")
      strwhere = strwhere + " like '%#{search_text}%'"
      strwhere = sqlwhere.gsub("@@",search_text) if sqlwhere != ""
      selecteddata = Object.const_get(table).find_by_sql("select #{strfields} from (#{sql}) as t where #{strwhere} limit 100;")
    end
    @search_text = search_text
    @selecteddata = selecteddata
    @fielddisps   =  fielddisps
    @fields       =  fields
    @table        =  table
    @idfield      =  idfield
    @group        =  group
    @dpath        =  dpath


=begin
    @str = ""
    @str = @str + "<input type='text' name='search_text' id='dialog_search_text' value='#{search_text}' />"
    @str = @str + "<input type='submit' value='送信' id='dialog_search_submit'/>"
    if  selecteddata.size == 1000 then
      @str = @str + " リスト内に表示出来ません。抽出してください。"
    end
    @str = @str + "<table id='select' >"
    @str = @str + "<tr>"
    fielddisps.each{|columname|
      @str = @str + "<th>"
      @str = @str + columname
      @str = @str + "</th>"
    }
    @str = @str + "</tr>"

    selecteddata.each{|data|
      @str = @str + "<tr class='dialog_line' >"
      fields.each{|colum|
        @str = @str + "<td class='dialog_itme' data-table='#{table}' data-idfield='#{idfield}' data-id='#{data[idfield]}' data-group='#{group}' >"
        @str = @str + data[colum].to_s
        @str = @str + "</td>"
      }
      @str = @str + "</tr>"
    }
    @str = @str + "</table>"
=end

  end
  def selected

    @diid = flashItem("default",params[:diid],"diid")
    @edialog = params[:edialog]

    sql = flashItem("default",params[:sql],"sql")
    #所属グループ
    @group = params[:group]
    @dpath = params[:dpath]
    #選択した情報
    @fields = nil
    @p_id   = params[:id]
    @idfield = params[:idfield]
    begin
      @fields = Object.const_get(params[:table]).find_by_sql("select * from (#{sql}) as t where #{params[:idfield]} = '#{params[:id]}' limit 1;")
      @field_first =  Object.const_get(params[:table]).find_by_sql("select * from (#{sql}) as t  limit 1;")
      #フィルド名リスト
      @fieldNames = []
        @field_first[0].attributes.keys.each{|column|
          @fieldNames << column
        }
    rescue

    end
  end
  private
  #値の取得
  #引数　default:デフォルト値
  #     paramsValue:paramsで受け取った値
  #     paramsName:内部的にflash[]で使われる名称
  def flashItem(default,paramsValue,paramsName)
    #params値に値が有る場合
    if paramsValue != nil then
      var = paramsValue
      flash[paramsName] = var
      #params値が無く、flashとしての保持データが有る場合
    elsif flash[paramsName] != nil then
      var = flash[paramsName]
      flash.keep[paramsName]
      #prams値とflashとしての保持データの両方が無い場合.(主に一番最初)
    else
      var = default
      flash[paramsName] = default
    end
    return var
  end
end
