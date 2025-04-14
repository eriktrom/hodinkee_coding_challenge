class Post < ApplicationRecord
  extend FriendlyId
  friendly_id :title, use: :slugged

  belongs_to :user

  validates :title, presence: true, length: { minimum: 3, maximum: 100 }
  validates :content, presence: true, length: { minimum: 20 }
  validates :hero_image, format: { with: URI::regexp(%w[http https]), message: "must be a valid URL with http or https" }, allow_blank: true
  validates :slug, uniqueness: true, presence: true

  # Add a default scope to order posts by creation date (newest first)
  default_scope { order(created_at: :desc) }

  # Add a method to get a truncated version of the content for previews
  def excerpt(length = 150)
    content.to_s.truncate(length)
  end

  # Behavior for slug generation
  # 1. New posts with duplicate titles get a unique slug with timestamp
  # 2. Existing posts keep their original slug when updated to a duplicate title
  # 3. Posts can still update their slug when title changes normally

  # Regenerate slug when title changes
  def should_generate_new_friendly_id?
    title_changed? || super
  end

  # Add sequence to duplicate slugs only for new posts
  def friendly_id
    slug = super
    if new_record? && Post.exists?(slug: slug)
      slug = "#{slug}-#{Time.now.to_i}"
    end
    slug
  end

  # Override the slug generation to handle duplicate titles
  def normalize_friendly_id(value)
    slug = super
    if persisted? && Post.where(slug: slug).where.not(id: id).exists?
      # If this is an update and the slug would be a duplicate, keep the old slug
      self.slug
    else
      slug
    end
  end
end
