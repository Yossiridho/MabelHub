'use-client'


import Sidebar from '@/components/sidebar/sidebar';
import type { Role } from '@/lib/menu'

export default function RequestSPHPage() {
    
    const role: Role = 'USER';

    return (
        <Sidebar role={role} />
    )
}