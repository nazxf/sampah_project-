<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        Role::create(['name' => 'siswa', 'label' => 'Siswa']);
        $unit = Unit::create(['nama' => 'SD Kampus B', 'jenis' => 'SD']);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'unit_id' => $unit->id,
        ]);

        $this->assertAuthenticated();
        $user = User::where('email', 'test@example.com')->first();
        $this->assertSame($unit->id, $user?->unit_id);
        $this->assertNull($user?->email_verified_at);
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->get(route('dashboard'))->assertRedirect(route('verification.notice'));
    }

    public function test_new_users_must_choose_unit(): void
    {
        Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('unit_id');
        $this->assertGuest();
    }

    public function test_registration_fails_if_siswa_role_is_missing(): void
    {
        $unit = Unit::create(['nama' => 'SD Kampus B', 'jenis' => 'SD']);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'unit_id' => $unit->id,
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
        ]);
    }

    public function test_registration_is_rate_limited(): void
    {
        Role::create(['name' => 'siswa', 'label' => 'Siswa']);

        for ($i = 1; $i <= 5; $i++) {
            $this->post('/register', [
                'name' => 'Test User ' . $i,
                'email' => 'rate-limited@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);
        }

        $this->post('/register', [
            'name' => 'Test User 6',
            'email' => 'rate-limited@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertTooManyRequests();
    }
}
