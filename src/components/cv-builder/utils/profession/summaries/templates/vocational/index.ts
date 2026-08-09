// utils/profession/summaries/templates/vocational/index.ts
// ============================================
// VOCATIONAL TEMPLATES - Combined Exports
// ============================================

import { ELECTRICAL_TECHNICIAN_TEMPLATES } from './electricalTechnician';
import { CNC_OPERATOR_TEMPLATES } from './cncOperator';
import { WELDER_TEMPLATES } from './welder';
import { MACHINE_OPERATOR_TEMPLATES } from './machineOperator';
import { STITCHING_MACHINE_OPERATOR_TEMPLATES } from './stitchingMachineOperator';
import { MASON_TEMPLATES } from './mason';
import { CIVIL_TECHNICIAN_TEMPLATES } from './civilTechnician';
import { AUTO_MECHANIC_TEMPLATES } from './autoMechanic';
import { HVAC_TECHNICIAN_TEMPLATES } from './hvacTechnician';
import { AGRICULTURAL_TECHNICIAN_TEMPLATES } from './agriculturalTechnician';

export const VOCATIONAL_TEMPLATES = {
    electricalTechnician: ELECTRICAL_TECHNICIAN_TEMPLATES,
    cncOperator: CNC_OPERATOR_TEMPLATES,
    welder: WELDER_TEMPLATES,
    machineOperator: MACHINE_OPERATOR_TEMPLATES,
    stitchingMachineOperator: STITCHING_MACHINE_OPERATOR_TEMPLATES,
    mason: MASON_TEMPLATES,
    civilTechnician: CIVIL_TECHNICIAN_TEMPLATES,
    autoMechanic: AUTO_MECHANIC_TEMPLATES,
    hvacTechnician: HVAC_TECHNICIAN_TEMPLATES,
    agriculturalTechnician: AGRICULTURAL_TECHNICIAN_TEMPLATES
};