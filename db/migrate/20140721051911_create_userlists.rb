class CreateUserlists < ActiveRecord::Migration
  def change
    create_table :userlists do |t|
      t.string :code

      t.timestamps
    end
  end
end
