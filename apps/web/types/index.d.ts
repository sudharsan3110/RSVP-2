type PropsWithClassName = {
  className?: string;
};

type FormSelectOption = {
  value: string;
  label: string;
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
