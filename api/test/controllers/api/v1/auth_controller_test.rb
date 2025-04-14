require "test_helper"

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      def setup
        @valid_user_params = {
          user: {
            email: "test@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }

        @invalid_user_params = {
          user: {
            email: "invalid-email",
            password: "short", # too short
            password_confirmation: "short"
          }
        }

        @login_params = {
          email: "test@example.com",
          password: "password123"
        }
      end

      # Signup Tests
      test "should signup user with valid params" do
        assert_difference("User.count") do
          post api_v1_auth_signup_url, params: @valid_user_params
        end

        assert_response :created
        response_data = JSON.parse(response.body)
        assert_equal "success", response_data["status"]
        assert_equal "User created successfully", response_data["message"]
        assert_not_nil response_data["data"]["token"]
        assert_equal @valid_user_params[:user][:email], response_data["data"]["user"]["email"]
        assert_nil response_data["data"]["user"]["password_digest"]
      end

      test "should not signup user with invalid email" do
        assert_no_difference("User.count") do
          post api_v1_auth_signup_url, params: {
            user: @valid_user_params[:user].merge(email: "invalid-email")
          }
        end

        assert_response :unprocessable_entity
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "User creation failed", response_data["message"]
        assert_includes response_data["errors"], "Email is invalid"
      end

      test "should not signup user with short password" do
        assert_no_difference("User.count") do
          post api_v1_auth_signup_url, params: {
            user: @valid_user_params[:user].merge(
              password: "short",
              password_confirmation: "short"
            )
          }
        end

        assert_response :unprocessable_entity
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "User creation failed", response_data["message"]
        assert_includes response_data["errors"], "Password is too short (minimum is 6 characters)"
      end

      test "should not signup user with mismatched passwords" do
        assert_no_difference("User.count") do
          post api_v1_auth_signup_url, params: {
            user: @valid_user_params[:user].merge(
              password_confirmation: "different_password"
            )
          }
        end

        assert_response :unprocessable_entity
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "User creation failed", response_data["message"]
        assert_includes response_data["errors"], "Password confirmation doesn't match Password"
      end

      test "should not signup user with existing email" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params

        # Try to create another user with the same email
        assert_no_difference("User.count") do
          post api_v1_auth_signup_url, params: @valid_user_params
        end

        assert_response :unprocessable_entity
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "User creation failed", response_data["message"]
        assert_includes response_data["errors"], "Email has already been taken"
      end

      test "should not signup user with missing required params" do
        assert_no_difference("User.count") do
          post api_v1_auth_signup_url, params: {
            user: {
              email: "",
              password: "",
              password_confirmation: ""
            }
          }
        end

        assert_response :unprocessable_entity
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "User creation failed", response_data["message"]
        assert_includes response_data["errors"], "Email can't be blank"
        assert_includes response_data["errors"], "Password can't be blank"
      end

      # Login Tests
      test "should login user with valid credentials" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params

        # Try to login
        post api_v1_auth_login_url, params: @login_params

        assert_response :success
        response_data = JSON.parse(response.body)
        assert_equal "success", response_data["status"]
        assert_equal "Login successful", response_data["message"]
        assert_not_nil response_data["data"]["token"]
        assert_equal @login_params[:email], response_data["data"]["user"]["email"]
        assert_nil response_data["data"]["user"]["password_digest"]
      end

      test "should not login with invalid email" do
        post api_v1_auth_login_url, params: {
          email: "nonexistent@example.com",
          password: "password123"
        }

        assert_response :unauthorized
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "Invalid email or password", response_data["message"]
      end

      test "should not login with invalid password" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params

        # Try to login with wrong password
        post api_v1_auth_login_url, params: {
          email: @login_params[:email],
          password: "wrongpassword"
        }

        assert_response :unauthorized
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "Invalid email or password", response_data["message"]
      end

      test "should not login with missing credentials" do
        post api_v1_auth_login_url, params: {}

        assert_response :unauthorized
        response_data = JSON.parse(response.body)
        assert_equal "error", response_data["status"]
        assert_equal "Invalid email or password", response_data["message"]
      end

      # JWT Token Tests
      test "should generate valid JWT token on successful login" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params

        # Login and get token
        post api_v1_auth_login_url, params: @login_params
        token = JSON.parse(response.body)["data"]["token"]

        # Verify token is valid
        decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
        assert_equal @login_params[:email], User.find(decoded["user_id"]).email
        assert decoded["exp"] > Time.current.to_i
      end

      test "should generate token with correct expiration" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params

        # Login and get token
        post api_v1_auth_login_url, params: @login_params
        token = JSON.parse(response.body)["data"]["token"]

        # Verify token expiration
        decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
        expected_exp = 24.hours.from_now.to_i
        assert_in_delta expected_exp, decoded["exp"], 5 # Allow 5 seconds difference
      end

      test "should generate valid token with correct user_id" do
        # Create a user first
        post api_v1_auth_signup_url, params: @valid_user_params
        user = User.find_by(email: @valid_user_params[:user][:email])

        # Login and get token
        post api_v1_auth_login_url, params: @login_params
        token = JSON.parse(response.body)["data"]["token"]

        # Verify token payload
        decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
        assert_equal user.id, decoded["user_id"]
        assert decoded["exp"] > Time.current.to_i
      end
    end
  end
end
