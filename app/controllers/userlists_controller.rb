class UserlistsController < ApplicationController
  before_action :set_userlist, only: [:show, :edit, :update, :destroy]

  # GET /userlists
  # GET /userlists.json
  def index
    @userlists = Userlist.all
  end

  # GET /userlists/1
  # GET /userlists/1.json
  def show
  end

  # GET /userlists/new
  def new
    @userlist = Userlist.new
  end

  # GET /userlists/1/edit
  def edit
  end

  # POST /userlists
  # POST /userlists.json
  def create
    @userlist = Userlist.new(userlist_params)

    respond_to do |format|
      if @userlist.save
        format.html { redirect_to @userlist, notice: 'Userlist was successfully created.' }
        format.json { render action: 'show', status: :created, location: @userlist }
      else
        format.html { render action: 'new' }
        format.json { render json: @userlist.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /userlists/1
  # PATCH/PUT /userlists/1.json
  def update
    respond_to do |format|
      if @userlist.update(userlist_params)
        format.html { redirect_to @userlist, notice: 'Userlist was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @userlist.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /userlists/1
  # DELETE /userlists/1.json
  def destroy
    @userlist.destroy
    respond_to do |format|
      format.html { redirect_to userlists_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_userlist
      @userlist = Userlist.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def userlist_params
      params.require(:userlist).permit(:code)
    end
end
