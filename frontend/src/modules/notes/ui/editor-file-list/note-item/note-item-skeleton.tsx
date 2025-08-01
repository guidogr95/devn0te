import { Card, CardContent, CardHeader, Skeleton } from "devnote/modules/shared";

export const NoteItemSkeleton = () => {
	return (
		<Card 
			className="overflow-hidden w-full bg-bg-primary border-transparent h-28"
		>
			<CardHeader className="pb-1 pt-3 px-3">
				<div className="flex justify-between items-start">
					<Skeleton className="h-5 w-24 bg-bg-secondary" />
					<Skeleton className="h-3 w-16 bg-bg-secondary" />
				</div>
			</CardHeader>
			<CardContent className="pt-1 pb-3 px-3">
				<Skeleton className="h-4 w-full bg-bg-secondary mb-1" />
				<Skeleton className="h-4 w-3/4 bg-bg-secondary" />
			</CardContent>
		</Card>
	);
};
