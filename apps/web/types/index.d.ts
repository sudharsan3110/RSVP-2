type PropsWithClassName<T = {}> = {
  className?: string;
} & T;

type FormSelectOption = {
  value: string;
  label: string;
};

type FormCapacityOption = {
  value: number;
  label: string;
  isOthers?: boolean;
};

type EmailAttachmentOptions = {
  filename: string;
  path: string;
  cid: string;
};

type PaginationParams = {
  page?: number;
  limit?: number;
  cursor?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
};
