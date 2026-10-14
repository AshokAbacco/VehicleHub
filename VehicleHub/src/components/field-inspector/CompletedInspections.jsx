import { Helmet } from 'react-helmet-async';
import { InspectionListPage } from '../../components/field-inspector/InspectionListPage.jsx';
import { useGetCompletedInspectionsQuery } from '../../services/fieldInspectorApiSlice.js';

export const CompletedInspections = () => {
    const { data, isLoading, isError } = useGetCompletedInspectionsQuery();
    return (
        <>
            <Helmet><title>Completed | VehicleHub Inspector</title></Helmet>
            <InspectionListPage
                title="Completed Inspections"
                subtitle="Your submitted verification reports."
                inspections={data?.data || []}
                isLoading={isLoading}
                isError={isError}
                emptyText="No completed inspections yet."
                showResult
            />
        </>
    );
};