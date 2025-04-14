require "test_helper"

class PostTest < ActiveSupport::TestCase
  def setup
    @user = users(:one)
    @valid_post = Post.new(
      title: "Valid Post Title",
      content: "This is a valid post content that meets the minimum length requirement of 20 characters.",
      user: @user,
      hero_image: "https://example.com/image.jpg"
    )
  end

  # Validation Tests
  test "should be valid with valid attributes" do
    assert @valid_post.valid?
  end

  test "should require a title" do
    @valid_post.title = nil
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:title], "can't be blank"
  end

  test "should require title length between 3 and 100 characters" do
    @valid_post.title = "ab"
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:title], "is too short (minimum is 3 characters)"

    @valid_post.title = "a" * 101
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:title], "is too long (maximum is 100 characters)"
  end

  test "should require content" do
    @valid_post.content = nil
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:content], "can't be blank"
  end

  test "should require content length of at least 20 characters" do
    @valid_post.content = "Short content"
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:content], "is too short (minimum is 20 characters)"
  end

  test "should validate hero_image URL format" do
    @valid_post.hero_image = "invalid-url"
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:hero_image], "must be a valid URL with http or https"

    @valid_post.hero_image = "http://example.com/image.jpg"
    assert @valid_post.valid?

    @valid_post.hero_image = "https://example.com/image.jpg"
    assert @valid_post.valid?

    @valid_post.hero_image = ""
    assert @valid_post.valid? # Should be valid when blank
  end

  # Association Tests
  test "should belong to a user" do
    @valid_post.user = nil
    assert_not @valid_post.valid?
    assert_includes @valid_post.errors[:user], "must exist"
  end

  test "should be destroyed when user is destroyed" do
    @valid_post.save
    assert_difference "Post.count", -1 do
      @user.destroy
    end
  end

  # Slug Tests
  test "should generate slug from title" do
    @valid_post.save
    assert_equal "valid-post-title", @valid_post.slug
  end

  test "should update slug when title changes" do
    @valid_post.save
    @valid_post.title = "New Title"
    @valid_post.save
    assert_equal "new-title", @valid_post.slug
  end

  test "should ensure slug uniqueness" do
    @valid_post.save
    duplicate_post = Post.new(
      title: "Valid Post Title",
      content: "This is another valid post content that meets the minimum length requirement.",
      user: @user
    )
    assert_not duplicate_post.valid?
    assert_includes duplicate_post.errors[:slug], "has already been taken"
  end

  # Scope Tests
  test "should order posts by creation date descending" do
    old_post = Post.create!(
      title: "Old Post",
      content: "This is an old post content that meets the minimum length requirement.",
      user: @user
    )
    new_post = Post.create!(
      title: "New Post",
      content: "This is a new post content that meets the minimum length requirement.",
      user: @user
    )
    assert_equal [new_post, old_post], Post.all
  end

  # Method Tests
  test "should generate excerpt of specified length" do
    @valid_post.content = "This is a very long content that needs to be truncated. " * 10
    assert_equal 150, @valid_post.excerpt.length
    assert @valid_post.excerpt.end_with?("...")
  end

  test "should generate excerpt of custom length" do
    @valid_post.content = "This is a very long content that needs to be truncated. " * 10
    assert_equal 50, @valid_post.excerpt(50).length
    assert @valid_post.excerpt(50).end_with?("...")
  end

  test "should handle nil content in excerpt" do
    @valid_post.content = nil
    assert_equal "", @valid_post.excerpt
  end

  # FriendlyId Tests
  test "should find post by slug" do
    @valid_post.save
    found_post = Post.friendly.find(@valid_post.slug)
    assert_equal @valid_post, found_post
  end

  test "should handle special characters in title for slug generation" do
    @valid_post.title = "Special & Characters! @#$%^&*()"
    @valid_post.save
    assert_equal "special-and-characters", @valid_post.slug
  end
end
