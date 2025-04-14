module Api
  module V1
    class AuthController < ApplicationController
      def signup
        user = User.new(user_params)

        if user.save
          token = generate_token(user)
          render json: {
            status: 'success',
            message: 'User created successfully',
            data: {
              user: user.as_json(except: :password_digest),
              token: token
            }
          }, status: :created
        else
          render json: {
            status: 'error',
            message: 'User creation failed',
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          token = generate_token(user)
          render json: {
            status: 'success',
            message: 'Login successful',
            data: {
              user: user.as_json(except: :password_digest),
              token: token
            }
          }
        else
          render json: {
            status: 'error',
            message: 'Invalid email or password'
          }, status: :unauthorized
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation)
      end

      def generate_token(user)
        JWT.encode(
          {
            user_id: user.id,
            exp: 24.hours.from_now.to_i
          },
          Rails.application.credentials.secret_key_base
        )
      end
    end
  end
end
