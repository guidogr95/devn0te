import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "devnote/utils/shadcn";
import { ScrollBar } from "./scroll-area";

import "./scroll-area.css";
import { Loader2 } from "lucide-react";
import { useOnScreen } from "../../hooks/use-on-screen";

type ScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  isfullheight?: string
	hasMore?: boolean
	isLoading?: boolean
	onScrolledToBottom?: () => void
};

export const InfiniteScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, isLoading, hasMore, onScrolledToBottom, children, ...props }, ref) => {

	const targetRef = useOnScreen<SVGSVGElement>({
		isLoading,
		callback: () => {
			if (hasMore && !isLoading) {
				onScrolledToBottom?.();
			}
		},
		options: {
			root: null,
			rootMargin: "0px",
			threshold: 0.1
		}
	});

	return (
		<ScrollAreaPrimitive.Root
			ref={ref}
			className={cn("relative overflow-hidden", className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport className={cn("h-full w-full rounded-[inherit] scroll-area-parent", { "full-height": !!props.isfullheight })}>
				{children}
				{hasMore && <Loader2 ref={targetRef} className="my-4 h-8 w-8 animate-spin m-auto" />}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
});
InfiniteScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

