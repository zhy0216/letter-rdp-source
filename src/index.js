import {many} from "arcsecond";
import {tag} from "./basic";
import {statement} from "./statement";

export const parser = many(statement).map(tag("Program", undefined, "body"))
