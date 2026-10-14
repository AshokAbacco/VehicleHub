import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { inventoryStatusData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const PendingApprovalPage = () => (
    <GenericTablePage
        title="Pending Approval"
        subtitle="Submitted listings awaiting review by the VehicleHub team."
        rows={inventoryStatusData['pending-approval']}
        columns={[
            { key: 'title', label: 'Vehicle' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'submittedAt', label: 'Submitted' },
        ]}
    />
);