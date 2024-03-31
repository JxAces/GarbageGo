<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function login(Request $request){
        $user = $this->validate($request,[
            'email' => 'required|email',
            'password' => 'required'
        ]);
        
        if(!Auth::attempt($user)){
            return response()->json([
                'errors' => ['message' => 'you entered an invalid email or password']
            ], 422);
        }
        
        $user= Auth::user();

        $token= auth()->user()->createToken('laravel_reactnative_login')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(){
        auth()->user()->tokens()->delete();

        return response()->json([
            'message' => 'logged out'
        ]);
    }

    public function register(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => ['message' => $validator->errors()->all()]
            ], 422);
        }
        
    
        $validatedData = $validator->validated();
    
        $user = User::create([
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
        ]);
    
        return response()->json($user, 201);
    }
}
