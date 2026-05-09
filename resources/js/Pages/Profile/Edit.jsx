import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout header="Profil Saya">
            <Head title="Profil" />

            <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="card">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="card">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="card">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
