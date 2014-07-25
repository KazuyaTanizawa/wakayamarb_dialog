json.array!(@userlists) do |userlist|
  json.extract! userlist, :id, :code
  json.url userlist_url(userlist, format: :json)
end
