import { GenericTablePage } from '../../components/seller/GenericTablePage.jsx';
import { inventoryStatusData } from '../../data/sellerPagesMock.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const RejectedVehiclesPage = () => (
    <GenericTablePage
        title="Rejected Vehicles"
        subtitle="Listings that need corrections before resubmitting."
        rows={inventoryStatusData['rejected-vehicles']}
        columns={[
            { key: 'title', label: 'Vehicle' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
            { key: 'reason', label: 'Rejection reason' },
        ]}
    />
);