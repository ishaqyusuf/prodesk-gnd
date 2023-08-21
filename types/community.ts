import {
  Builders,
  CommunityModels,
  CostCharts,
  HomeTasks,
  HomeTemplates,
  Homes,
  Projects,
  Tasks,
} from "@prisma/client";

export type IProject = Projects & {
  meta: {
    supervisor: {
      name;
      email;
    };
    media?: string[];
    addon?;
  };
  _count: {
    homes;
  };
  builder: IBuilder;
};
export type IBuilder = Builders & {
  meta: {
    address;
    tasks: {
      billable: Boolean;
      name: string;
      produceable: Boolean;
      installable: Boolean;
      uid: string;
      invoice_search;
    }[];
  };
  _count: {
    projects;
  };
};
export type IHome = Homes & {
  meta: {};
  project: IProject;
  tasks: ITasks[];
  jobs: Tasks[];
};

export type ITasks = HomeTasks & {
  meta: {};
};
export interface IHomeStatus {
  produceables: number;
  produced: number;
  pendingProduction: number;
  productionStatus;
  badgeColor;
}
export type IHomeTemplate = HomeTemplates & {
  meta: HomeTemplateMeta;
  builder: IBuilder;
  homes: IHome[];
  costs: ICostChart[];
  _count: {
    homes;
  };
};
export type ICommunityTemplate = CommunityModels & {
  project: IProject;
  meta: {
    design: CommunityTemplateDesign;
  };
};
export interface HomeTemplateMeta {
  design: HomeTemplateDesign;
  // taskCosts: { [id in string]: number };

  installCosts: {
    costings: {
      title?;
      cost?: number;
      maxQty?: number;
    }[];
    title?;
    uid?;
  }[];
}
export interface TemplateDesign<T> {
  entry: Entry<T>;
  garageDoor: GarageDoor<T>;
  interiorDoor: InteriorDoor<T>;
  doubleDoor: DoubleDoor<T>;
  bifoldDoor: BifoldDoor<T>;
  lockHardware: LockHardWare<T>;
  decoShutters: DecoShutters<T>;
}
export type HomeTemplateDesign = TemplateDesign<string>;
export type CommunityTemplateDesign = TemplateDesign<{ k: string; c: boolean }>;

export type ICostChart = CostCharts & {
  meta: {
    totalCost;
    totalTask;
    tax: { [k in string]: number };
    costs: { [k in string]: number };
    totalUnits: { [k in string]: number };
    lastSync: {
      date;
      tasks: any;
      units;
    };
  };
};
export interface Entry<T> {
  material: T;
  bore: T;
  sixEight: T;
  orientation: T;
  statusColor: T;
  layer: T;
  others: T;
  eightZero: T;
  sideDoor: T;
  size1: T;
  model: T;
}
export interface GarageDoor<T> {
  material: T;
  ph: T;
  frame: T;
  bore: T;
  orientation: T;
  statusColor: T;
  single: T;
  type: T;
  doorHeight: T;
  doorSize: T;
  size1: T;
  model: T;
  doorSize1: T;
  orientation1: T;
}
export interface InteriorDoor<T> {
  style: T;
  jambSize: T;
  casingStyle: T;
  doorType: T;
  orientation1: T;
  height1: T;
  two1Lh: T;
  twoSix1Lh: T;
  twoEight1Rh: T;
  twoTen1Lh: T;
  statusColor: T;
  twoSix1Rh: T;
  twoEight1Lh: T;
  twoTen1Rh: T;
  oneSix1Lh: T;
  twoFour1Rh: T;
  oneSix1Rh: T;
  two1Rh: T;
  twoFour1Lh: T;
  height2: T;
  two2Lh: T;
  twoSix2Lh: T;
  twoTen2Lh: T;
  twoTen2Rh: T;
  twoEight2Lh: T;
  twoSix2Rh: T;
  twoEight2Rh: T;
  two2Rh: T;
  doorSize1: T;
  oneSix2Lh: T;
  oneSix2Rh: T;
  twoFour2Lh: T;
  twoFour2Rh: T;
  three2Rh: T;
  three2Lh: T;
  three1Lh: T;
  three1Rh: T;
}
export interface DoubleDoor<T> {
  statusColor: T;
  specialDoor: T;
  specialDoor3: T;
  pocketDoor: T;
  sixLh: T;
  fiveLh: T;
  others: T;
  specialDoor2: T;
  mirrored: T;
  specialDoor4: T;
  fiveRh: T;
  fiveEightLh: T;
  fiveEightRh: T;
  fourRh: T;
  fourLh: T;
  swingDoor: T;
  fiveFourLh: T;
  fiveFourRh;
  sixRh: T;
}
export interface BifoldDoor<T> {
  style: T;
  five: T;
  twoSix: T;
  twoSixLl: T;
  twoFourLl: T;
  bifoldOther2: T;
  bifoldOther2Qty: T;
  two: T;
  crownQty: T;
  casing: T;
  qty: T;
  scuttle: T;
  scuttleQty: T;
  casingQty: T;
  statusColor: T;
  casingStyle: T;
  six: T;
  oneEight: T;
  oneSix: T;
  twoFour: T;
  three: T;
  fourEight: T;
  twoEightLl: T;
  four: T;
  crown: T;
  twoEight: T;
  palosQty: T;
  threeLl: T;
  one: T;
  bifoldOther1: T;
  bifoldOther1Qty: T;
}
export interface LockHardWare<T> {
  style: T;
  jambSize: T;
  hookAye;
  casingStyle: T;
  doorType: T;
  height1: T;
  twoSix1Lh: T;
  twoEight1Rh: T;
  twoTen1Lh: T;
  statusColor: T;
  handleSet: T;
  deadbolt: T;
  passage: T;
  privacy: T;
  doorStop: T;
  doorViewer: T;
  wStripper: T;
  hinges: T;
  brand: T;
  twoSix1Rh: T;
  twoEight1Lh: T;
  twoTen1Rh: T;
  twoFour1Lh: T;
  twoFour1Rh: T;
  oneSix1Lh: T;
  oneSix1Rh: T;
  two1Lh: T;
  height2: T;
  two2Lh: T;
  twoSix2Lh: T;
  twoSix2Rh: T;
  twoEight2Lh: T;
  twoEight2Rh: T;
  two1Rh: T;
  two2Rh: T;
  size1: T;
  model: T;
  dummy: T;
  oneSix2Lh: T;
}
export interface DecoShutters<T> {
  model: T;
  size2;
  size1: T;
  statusColor: T;
}
