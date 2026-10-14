import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { inventoryStatusData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const ApprovedVehiclesPage = () => (
    <GenericTablePage
        title="Approved Vehicles"
        subtitle="Live and approved for buyers to discover."
        rows={inventoryStatusData['approved-vehicles']}
        columns={[
            { key: 'title', label: 'Vehicle' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'approvedAt', label: 'Approved' },
        ]}
    />
);