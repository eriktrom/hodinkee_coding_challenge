require "test_helper"

module Api
  module V1
    class PostsControllerTest < ActionDispatch::IntegrationTest
      def setup
        @user = users(:one)
        @post = posts(:one)
        @token = generate_token(@user)
      end

      test "should get index" do
        get api_v1_posts_url
        assert_response :success
        assert_not_nil JSON.parse(response.body)["data"]
      end

      test "should get index with pagination" do
        get api_v1_posts_url, params: { page: 1, per_page: 5 }
        assert_response :success
        response_data = JSON.parse(response.body)
        assert_not_nil response_data["data"]
        assert_not_nil response_data["meta"]
        assert_equal 1, response_data["meta"]["current_page"]
        assert_equal 5, response_data["meta"]["per_page"]
      end

      test "should get show" do
        get api_v1_post_url(@post)
        assert_response :success
        assert_equal @post.title, JSON.parse(response.body)["data"]["title"]
      end

      test "should return 404 for non-existent post" do
        get api_v1_post_url(id: "non-existent")
        assert_response :not_found
        assert_equal "Post not found", JSON.parse(response.body)["message"]
      end

      test "should create post when authenticated" do
        assert_difference("Post.count") do
          post api_v1_posts_url,
            params: { post: {
              title: "New Post",
              content: "This is longer than 20 characters",
              description: "This is a valid description that meets the minimum length requirement."
            } },
            headers: { Authorization: "Bearer #{@token}" }
        end
        assert_response :created
        assert_equal "New Post", JSON.parse(response.body)["data"]["title"]
        assert_equal "This is a valid description that meets the minimum length requirement.", JSON.parse(response.body)["data"]["description"]
      end

      test "should not create post without authentication" do
        assert_no_difference("Post.count") do
          post api_v1_posts_url,
            params: { post: { title: "New Post", content: "This is longer than 20 characters" } }
        end
        assert_response :unauthorized
      end

      test "should not create post with invalid params" do
        assert_no_difference("Post.count") do
          post api_v1_posts_url,
            params: { post: { title: "", content: "", description: "" } },
            headers: { Authorization: "Bearer #{@token}" }
        end
        assert_response :unprocessable_entity
        assert_not_empty JSON.parse(response.body)["errors"]
      end

      test "should update post when authenticated and authorized" do
        patch api_v1_post_url(@post),
          params: { post: {
            title: "Updated Title",
            description: "Updated description for the post."
          } },
          headers: { Authorization: "Bearer #{@token}" }
        assert_response :success
        assert_equal "Updated Title", JSON.parse(response.body)["data"]["title"]
        assert_equal "Updated description for the post.", JSON.parse(response.body)["data"]["description"]
      end

      test "should not update post without authentication" do
        patch api_v1_post_url(@post),
          params: { post: { title: "Updated Title" } }
        assert_response :unauthorized
      end

      test "should not update post when not authorized" do
        other_user = users(:two)
        other_token = generate_token(other_user)
        patch api_v1_post_url(@post),
          params: { post: { title: "Updated Title" } },
          headers: { Authorization: "Bearer #{other_token}" }
        assert_response :unauthorized
      end

      test "should destroy post when authenticated and authorized" do
        assert_difference("Post.count", -1) do
          delete api_v1_post_url(@post),
            headers: { Authorization: "Bearer #{@token}" }
        end
        assert_response :success
      end

      test "should not destroy post without authentication" do
        assert_no_difference("Post.count") do
          delete api_v1_post_url(@post)
        end
        assert_response :unauthorized
      end

      test "should not destroy post when not authorized" do
        other_user = users(:two)
        other_token = generate_token(other_user)
        assert_no_difference("Post.count") do
          delete api_v1_post_url(@post),
            headers: { Authorization: "Bearer #{other_token}" }
        end
        assert_response :unauthorized
      end

      private

      def generate_token(user)
        JWT.encode(
          { user_id: user.id, exp: 24.hours.from_now.to_i },
          Rails.application.credentials.secret_key_base
        )
      end
    end
  end
end
