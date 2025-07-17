import GoBack from "@/components/GoBack";
// import { useParams } from "react-router-dom";

const ViewEventSponsorDetails: React.FC = () => {
    // const { id } = useParams<{ id: string }>();
    return (
        <div>
            <GoBack />

            <div className="max-w-2xl mx-auto p-5 bg-brand-background mt-5 rounded-2xl">
                <div className="flex gap-5 items-center mb-5">
                    <div className="size-28 bg-brand-primary rounded-full"></div>
                    <h3 className="font-semibold">Lorem ipsum dolor</h3>
                </div>
                <h5 className="text-xl font-bold">About Company</h5>

                <p className="mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis est quis animi, sed architecto soluta quam, eveniet unde, provident exercitationem temporibus placeat possimus? Laboriosam minus eum repellendus architecto deleniti veritatis asperiores maiores itaque quos. Corrupti consectetur, quibusdam reprehenderit commodi placeat velit eum ad eos vitae delectus, neque aspernatur, maxime possimus!</p>

                <p className="mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis est quis animi, sed architecto soluta quam, eveniet unde, provident exercitationem temporibus placeat possimus? Laboriosam minus eum repellendus architecto deleniti veritatis asperiores maiores itaque quos. Corrupti consectetur, quibusdam reprehenderit commodi placeat velit eum ad eos vitae delectus, neque aspernatur, maxime possimus!</p>

                <div className="grid grid-cols-3 gap-5 mt-5">
                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                    <div className="flex flex-col gap-1 mb-5 items-center">
                        <div className="size-28 bg-brand-primary rounded-full"></div>
                        <h5 className="font-semibold">Deo Yadav</h5>
                        <span className="text-sm leading-0">Google</span>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ViewEventSponsorDetails;