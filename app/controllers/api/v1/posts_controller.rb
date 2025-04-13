module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_user!, except: [:index, :show]
      before_action :set_post, only: [:show, :update, :destroy]
      before_action :authorize_user!, only: [:update, :destroy]

      # GET /api/v1/posts
      def index
        @posts = Post.includes(:user).order(created_at: :desc)

        # Add pagination
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        @posts = @posts.offset((page.to_i - 1) * per_page.to_i).limit(per_page.to_i)

        render json: {
          data: @posts.map { |post| post_json(post) },
          meta: {
            current_page: page.to_i,
            per_page: per_page.to_i,
            total_posts: Post.count,
            total_pages: (Post.count.to_f / per_page.to_i).ceil
          }
        }
      end

      # GET /api/v1/posts/:id
      def show
        render json: { data: post_json(@post) }
      end

      # POST /api/v1/posts
      def create
        @post = current_user.posts.build(post_params)

        if @post.save
          render json: { data: post_json(@post) }, status: :created
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/posts/:id
      def update
        if @post.update(post_params)
          render json: { data: post_json(@post) }
        else
          render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/posts/:id
      def destroy
        @post.destroy
        head :no_content
      end

      private

      def set_post
        @post = Post.find(params[:id])
      end

      def post_params
        params.require(:post).permit(:title, :content, :hero_image)
      end

      def authorize_user!
        unless @post.user == current_user
          render json: { error: 'Unauthorized' }, status: :forbidden
        end
      end

      def post_json(post)
        {
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          hero_image: post.hero_image,
          user_email: post.user.email,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      end
    end
  end
end
