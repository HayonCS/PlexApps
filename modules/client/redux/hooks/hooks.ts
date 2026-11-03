import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, State } from "../store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<State>();
