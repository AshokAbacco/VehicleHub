import { Helmet } from 'react-helmet-async';
import { InspectionListPage } from '../../components/field-inspector/InspectionListPage.jsx';
import { useGetInProgressInspectionsQuery } from '../../services/fieldInspectorApiSlice.js';

export const InProgressInspections = () => {
    const { data, isLoading, isError } = useGetInProgressInspectionsQuery();
    return (
        <>
            <Helmet><title>In Progress | VehicleHub Inspector</title></Helmet>
            <InspectionListPage
                title="In Progress"
                subtitle="Inspections you've started but not yet submitted."
                inspections={data?.data || []}
                isLoading={isLoading}
                isError={isError}
                emptyText="No inspections in progress."
            />
        </>
    );
};