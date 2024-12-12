export default async function CustomerOverviewPage({ params }) {
    const slug = params.slug;
    const whereKey = !isNaN(Number(slug)) ? "id" : "phoneNo";
    return <div></div>;
}
