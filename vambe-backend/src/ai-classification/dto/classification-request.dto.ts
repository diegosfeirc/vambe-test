import { ClientMeeting } from '../../csv-parser/interfaces/client-meeting.interface';

export class ClassificationRequestDto {
  clients: ClientMeeting[];

  constructor(clients: ClientMeeting[]) {
    this.clients = clients;
  }
}
