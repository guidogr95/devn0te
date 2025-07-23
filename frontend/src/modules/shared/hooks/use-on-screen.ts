import { useCallback, useEffect, useRef } from "react";

type UseOnScreenOptions = {
	root?: Element | null
	rootMargin?: string
	threshold?: number | number[]
}

type Props = {
	isLoading?: boolean
	callback?: () => void
	options: UseOnScreenOptions
}

export function useOnScreen<T extends Element>({
	isLoading,
	callback,
	options
}: Props): React.RefObject<T> {

	const targetRef = useRef<T>(null);

	const hasIntersected = useRef(false);

	const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {

		const [entry] = entries;

		if (entry.isIntersecting) {
			hasIntersected.current = true;
			
			if (!isLoading) {
				callback?.();
			}
		} else {
			hasIntersected.current = false;
		}



	}, [callback, isLoading]);

	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, options);
		let currentTarget = null;

		if (targetRef.current) {
			currentTarget = targetRef.current;
			observer.observe(targetRef.current);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};

	}, [handleIntersection, options]);

	return targetRef;
}
