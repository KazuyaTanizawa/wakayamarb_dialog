json.array!(@users) do |user|
  json.extract! user, :id, :name, :phone, :code
  json.url user_url(user, format: :json)
end
