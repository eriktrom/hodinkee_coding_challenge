module Api
  module V1
    class PostsController < ApplicationController
      before_action :set_post, only: [:show, :update, :destroy]
      before_action :authenticate_user, only: [:create, :update, :destroy]

      # GET /api/v1/posts
      def index
        @posts = Post.all
        render json: {
          status: 'success',
          data: @posts.map { |post| post_json(post) }
        }
      end

      # GET /api/v1/posts/:id
      def show
        render json: {
          status: 'success',
          data: post_json(@post)
        }
      end

      # POST /api/v1/posts
      def create
        @post = current_user.posts.build(post_params)

        if @post.save
          render json: {
            status: 'success',
            message: 'Post created successfully',
            data: post_json(@post)
          }, status: :created
        else
          render json: {
            status: 'error',
            message: 'Post creation failed',
            errors: @post.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/posts/:id
      def update
        if @post.user_id != current_user.id
          return render json: {
            status: 'error',
            message: 'You are not authorized to update this post'
          }, status: :unauthorized
        end

        if @post.update(post_params)
          render json: {
            status: 'success',
            message: 'Post updated successfully',
            data: post_json(@post)
          }
        else
          render json: {
            status: 'error',
            message: 'Post update failed',
            errors: @post.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/posts/:id
      def destroy
        if @post.user_id != current_user.id
          return render json: {
            status: 'error',
            message: 'You are not authorized to delete this post'
          }, status: :unauthorized
        end

        @post.destroy
        render json: {
          status: 'success',
          message: 'Post deleted successfully'
        }
      end

      private

      def set_post
        @post = Post.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          status: 'error',
          message: 'Post not found'
        }, status: :not_found
      end

      def post_params
        params.require(:post).permit(:title, :content)
      end

      def post_json(post)
        {
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          user_id: post.user_id,
          user_email: post.user.email,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      end

      def authenticate_user
        token = request.headers['Authorization']&.split(' ')&.last
        if token
          begin
            decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
            @current_user = User.find(decoded['user_id'])
          rescue JWT::DecodeError, ActiveRecord::RecordNotFound
            render json: { status: 'error', message: 'Invalid token' }, status: :unauthorized
          end
        else
          render json: { status: 'error', message: 'Authentication required' }, status: :unauthorized
        end
      end

      def current_user
        @current_user
      end
    end
  end
end
