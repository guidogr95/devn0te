import { Sidebar } from "devnote/modules/dashboard/ui";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	isSomething?: boolean
}>

export const DashboardLayout = ({ children }: Props) => {
	return (
		<Sidebar>
			{children}
		</Sidebar>
	);
};
