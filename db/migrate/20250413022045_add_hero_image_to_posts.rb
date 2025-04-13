class AddHeroImageToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :hero_image, :string
  end
end
