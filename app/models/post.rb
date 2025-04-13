class Post < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { minimum: 3, maximum: 100 }
  validates :content, presence: true, length: { minimum: 20 }
  validates :hero_image, format: { with: URI::regexp(%w[http https]), message: "must be a valid URL with http or https" }, allow_blank: true

  # Add a default scope to order posts by creation date (newest first)
  default_scope { order(created_at: :desc) }

  # Add a method to get a truncated version of the content for previews
  def excerpt(length = 150)
    content.to_s.truncate(length)
  end
end
