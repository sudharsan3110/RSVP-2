'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const guests = [
    {
      name: 'Olivia Rhye',
      username: '@olivia',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Phoenix Baker',
      username: '@phoenix',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Lana Steiner',
      username: '@lana',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Demi Wilkinson',
      username: '@demi',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Candice Wu',
      username: '@candice',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Natali Craig',
      username: '@natali',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Drew Cano',
      username: '@drew',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Orlando Diggs',
      username: '@orlando',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Andi Lane',
      username: '@andi',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
    {
      name: 'Kate Morrison',
      username: '@kate',
      ticketId: 'X7F9-R2K3',
      status: 'Checked In',
      date: '22 Jan 2022',
    },
  ];

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filter === 'All' || guest.status === filter)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Guest List</h2>
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-4 sm:flex sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="relative w-full flex-1 sm:w-auto">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search User"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:w-[400px]"
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="flex flex-wrap justify-center sm:justify-start">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="CheckedIn">Checked In</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>
                  Status <ArrowDown className="inline h-5 w-5" />
                </TableHead>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Allow Guest</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{guest.name}</div>
                      <div className="text-sm text-muted-foreground">{guest.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">{guest.status}</Badge>
                  </TableCell>
                  <TableCell>{guest.ticketId}</TableCell>
                  <TableCell>
                    <Switch />
                  </TableCell>
                  <TableCell>{guest.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
          <PaginationPrevious href="#" />
          <PaginationContent className="flex space-x-2">
            <PaginationLink href="#">1</PaginationLink>
            <PaginationLink href="#">2</PaginationLink>
            <PaginationLink href="#">3</PaginationLink>
            <PaginationEllipsis />
            <PaginationLink href="#">8</PaginationLink>
            <PaginationLink href="#">9</PaginationLink>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationContent>
          <PaginationNext href="#" />
        </Pagination>
      </div>
    </div>
  );
}
