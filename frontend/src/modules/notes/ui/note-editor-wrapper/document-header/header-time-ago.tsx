import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const UPDATE_INTERVAL_MS = 180_000;

type Props = {
	dateString?: string
}

export const HeaderTimeAgo = ({
	dateString
}: Props) => {
	const [formattedDate, setFormattedDate] = useState("");

	useEffect(() => {
		const updateFormattedDate = () => {
			const newFormattedDate = dateString
				? formatDistanceToNow(new Date(dateString), { addSuffix: true })
				: "";

				setFormattedDate(newFormattedDate);
		};

		updateFormattedDate();

		const intervalId = setInterval(updateFormattedDate, UPDATE_INTERVAL_MS);

		return () => clearInterval(intervalId);

	}, [dateString]);

	return (
		<span className="text-sm text-gray-400">
			Last updated { formattedDate }
		</span>
	);
};
