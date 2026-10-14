import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { teamMembersData } from '../../data/sellerPagesMock.js';

export const TeamMembersPage = () => (
    <GenericTablePage
        title="Team Members"
        subtitle="People with access to your seller account."
        rows={teamMembersData}
        columns={[
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Status' },
        ]}
    />
);