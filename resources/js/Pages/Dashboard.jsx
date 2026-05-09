import { usePage, router } from '@inertiajs/react';
import SuperAdmin from './Dashboard/SuperAdmin';
import AdminUnit from './Dashboard/AdminUnit';
import Petugas from './Dashboard/Petugas';
import Siswa from './Dashboard/Siswa';

export default function Dashboard(props) {
    const { auth } = usePage().props;
    const role = auth?.user?.role;

    switch (role) {
        case 'super_admin':
            return <SuperAdmin {...props} />;
        case 'admin_unit':
            return <AdminUnit {...props} />;
        case 'petugas':
            return <Petugas {...props} />;
        case 'siswa':
            return <Siswa {...props} />;
        default:
            router.get(route('login'));
            return null;
    }
}
