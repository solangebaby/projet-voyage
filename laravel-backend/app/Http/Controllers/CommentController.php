<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Get all comments (public or for a specific trip)
     */
    public function index(Request $request)
    {
        $query = Comment::with(['user', 'trip']);

        // Filter by trip if trip_id is provided
        if ($request->has('trip_id')) {
            $query->where('trip_id', $request->trip_id);
        }

        // Filter by status if provided (for admin moderation)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // By default, show only approved comments for public
            if (!auth()->check() || auth()->user()->role !== 'admin') {
                $query->where('status', 'approved');
            }
        }

        $comments = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $comments
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trip_id' => 'nullable|exists:trips,id',
            'content' => 'required|string|min:10',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'trip_id' => $request->trip_id,
            'content' => $request->content,
            'rating' => $request->rating,
            'status' => 'pending' // Comments need admin approval
        ]);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment submitted successfully. It will be visible after approval.',
            'data' => $comment
        ], 201);
    }

    /**
     * Update comment status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = Comment::findOrFail($id);
        $comment->status = $request->status;
        $comment->save();

        return response()->json([
            'success' => true,
            'message' => 'Comment status updated successfully',
            'data' => $comment
        ]);
    }

    /**
     * Delete a comment
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        // Only admin or comment owner can delete
        if (auth()->user()->role !== 'admin' && $comment->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully'
        ]);
    }

    /**
     * Get user's own comments
     */
    public function getUserComments($userId)
    {
        // Check authorization
        if ($userId != auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $comments = Comment::with(['trip'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments
        ]);
    }
}
