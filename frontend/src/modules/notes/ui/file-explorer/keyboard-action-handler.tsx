import { useActionDialogsActions } from "devnote/modules/shared/hooks/use-action-dialog-actions";
import { selectDialogType, selectIsActionDialogOpen } from "devnote/modules/shared/redux/selectors/action-dialog-selectors";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectedSelectedIndex, selectLocalQueryResults } from "../../redux/selector/query-local-notes-selectors";
import { AppDispatch } from "devnote/redux/store/store";
import { decrementSelectedIndex, incrementSelectedIndex } from "../../redux/slice/notes.slice";
import { useQueryLocalNotes } from "../../hooks/use-query-local-notes";

export const KeyboardActionHandler = () => {

	const {
		toggleOpen,
		toggleClose
	} = useActionDialogsActions();

	const {
		handleSelectResult
	} = useQueryLocalNotes();

	const dispatch = useDispatch<AppDispatch>();

	const isActionDialogOpen = useSelector(selectIsActionDialogOpen);
	const dialogType = useSelector(selectDialogType);
	const localQueryResults = useSelector(selectLocalQueryResults);
	const selectedIndex = useSelector(selectedSelectedIndex);
	

	const handleCreateFileToggle = useCallback((e: KeyboardEvent) => {
		if (isActionDialogOpen && dialogType !== "create-file") return;

		
		if (isActionDialogOpen) {
			e.preventDefault();
			toggleClose("create-file");
			return;
		}
		e.preventDefault();
		toggleOpen("create-file");
	}, [dialogType, isActionDialogOpen, toggleClose, toggleOpen]);

	const handleSearchToggle = useCallback((e: KeyboardEvent) => {
		if (isActionDialogOpen && dialogType !== "search") return;


		if (isActionDialogOpen) {
			e.preventDefault();

			toggleClose("search");
			return;
		}

		e.preventDefault();
		toggleOpen("search");
	}, [dialogType, isActionDialogOpen, toggleClose, toggleOpen]);

	const handleOpenDialogArrowDown = useCallback((e: KeyboardEvent) => {
		if (dialogType === "search") {
			e.preventDefault();

			dispatch(incrementSelectedIndex());
		}
	}, [dialogType, dispatch]);

	const handleOpenDialogArrowUp = useCallback((e: KeyboardEvent) => {
		if (dialogType === "search") {
			e.preventDefault();
			dispatch(decrementSelectedIndex());
		}
	}, [dialogType, dispatch]);

	const handleOpenDialogEnter = useCallback((e: KeyboardEvent) => {
		if (dialogType === "search" && localQueryResults.length) {
			e.preventDefault();
			const selected = localQueryResults[selectedIndex];
			handleSelectResult(selected.id);
		}
	}, [dialogType, handleSelectResult, localQueryResults, selectedIndex]);

	const altKeyHandlerMap = useMemo<Record<string, (e: KeyboardEvent) => void>>(() => ({
		"n": handleCreateFileToggle,
		"k": handleSearchToggle,
	}), [handleCreateFileToggle, handleSearchToggle]);

	const openDialogHandlers = useMemo<Record<string, (e: KeyboardEvent) => void>>(() => ({
		"ArrowDown": handleOpenDialogArrowDown,
		"ArrowUp": handleOpenDialogArrowUp,
		"Enter": handleOpenDialogEnter
	}), [handleOpenDialogArrowDown, handleOpenDialogArrowUp, handleOpenDialogEnter]);

	useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {


				if (e.altKey && Object.keys(altKeyHandlerMap).includes(e.key)) {

					altKeyHandlerMap[e.key](e);
					return;
				}

				if (!isActionDialogOpen) return;
				
				if (!Object.keys(openDialogHandlers).includes(e.key)) return;

				openDialogHandlers[e.key](e);

			};
	
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);

		}, [altKeyHandlerMap, isActionDialogOpen, openDialogHandlers]);

	return null;
};
