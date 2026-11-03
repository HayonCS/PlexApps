import * as Hexagonal from "atomic-object/hexagonal";

import { Subversion } from "subversion";

export const SubversionPort = Hexagonal.port<Subversion, "subversion">("subversion");
