// utils/profession/summaries/fresher/vocational/index.ts
// ============================================
// VOCATIONAL FRESHER TEMPLATES - Combined Exports
// ============================================

import { ELECTRICAL_TECHNICIAN_FRESHER } from './electricalTechnician.fresher';
import { CNC_OPERATOR_FRESHER } from './cncOperator.fresher';
import { WELDER_FRESHER } from './welder.fresher';
import { MACHINE_OPERATOR_FRESHER } from './machineOperator.fresher';
import { STITCHING_MACHINE_OPERATOR_FRESHER } from './stitchingMachineOperator.fresher';
import { MASON_FRESHER } from './mason.fresher';
import { CIVIL_TECHNICIAN_FRESHER } from './civilTechnician.fresher';
import { AUTO_MECHANIC_FRESHER } from './autoMechanic.fresher';
import { HVAC_TECHNICIAN_FRESHER } from './hvacTechnician.fresher';
import { AGRICULTURAL_TECHNICIAN_FRESHER } from './agriculturalTechnician.fresher';

export const VOCATIONAL_FRESHER_TEMPLATES: Record<string, string[]> = {
    electricalTechnician: ELECTRICAL_TECHNICIAN_FRESHER,
    cncOperator: CNC_OPERATOR_FRESHER,
    welder: WELDER_FRESHER,
    machineOperator: MACHINE_OPERATOR_FRESHER,
    stitchingMachineOperator: STITCHING_MACHINE_OPERATOR_FRESHER,
    mason: MASON_FRESHER,
    civilTechnician: CIVIL_TECHNICIAN_FRESHER,
    autoMechanic: AUTO_MECHANIC_FRESHER,
    hvacTechnician: HVAC_TECHNICIAN_FRESHER,
    agriculturalTechnician: AGRICULTURAL_TECHNICIAN_FRESHER
};