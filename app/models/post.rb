class Post < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { minimum: 3, maximum: 100 }
  validates :content, presence: true, length: { minimum: 10 }

  # Add a default scope to order posts by creation date (newest first)
  default_scope { order(created_at: :desc) }

  # Add a method to get a truncated version of the content for previews
  def excerpt(length = 150)
    content.length > length ? content[0..length] + "..." : content
  end
end
