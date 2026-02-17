<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCredentialsActivated;

class SendUserCredentials extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:send-credentials {user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send user credentials after account activation by admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);

        if (!$user) {
            $this->error("User not found!");
            return 1;
        }

        try {
            Mail::to($user->email)->send(new UserCredentialsActivated($user));
            $this->info("✅ Credentials sent to {$user->email}");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to send credentials: " . $e->getMessage());
            return 1;
        }
    }
}
