import { getRandomNumber, getRandomItems } from '../utils.js';

const rawPoints = [
  {
    'id': '6a1441e1-0de0-4be9-9462-d65c8bcd37a5',
    'basePrice': 7420,
    'dateFrom': '2026-02-18T12:31:04.623Z',
    'dateTo': '2026-02-20T00:42:04.623Z',
    'destination': '0f265007-eb09-4edf-b70d-9b70ec609b62',
    'isFavorite': false,
    'offers': [
      '81859880-1a17-4bb0-8f20-1ed5adb356b0',
      'ddfc3c57-8f05-4976-bd02-609c73a2436d'
    ],
    'type': 'taxi'
  },
  {
    'id': '1394b240-9963-43a7-a739-86dcb9478705',
    'basePrice': 9848,
    'dateFrom': '2026-02-21T05:46:04.623Z',
    'dateTo': '2026-02-23T02:52:04.623Z',
    'destination': '8f996d94-2d24-4f3a-babf-4437074783d8',
    'isFavorite': false,
    'offers': [
      '3901fbaa-84af-4fbf-9aa1-a70788261ac9',
      'ee6c02ae-9421-41be-b060-bf4d3fffaa84',
      '4b57c3d7-e29b-4fcb-a487-a9dbbcc98ffb'
    ],
    'type': 'train'
  },
  {
    'id': 'a5436719-7423-40f8-8b52-0a3c03398038',
    'basePrice': 3947,
    'dateFrom': '2026-02-23T23:14:04.623Z',
    'dateTo': '2026-02-25T10:10:04.623Z',
    'destination': 'bb636a26-2be1-4fab-9b2b-24ec74e8e060',
    'isFavorite': true,
    'offers': [],
    'type': 'train'
  },
  {
    'id': 'f705b6c7-d88d-4e1c-a8c5-0b7a67c32a55',
    'basePrice': 644,
    'dateFrom': '2026-02-26T21:02:04.623Z',
    'dateTo': '2026-02-27T22:46:04.623Z',
    'destination': '2e2f0f11-85c5-418e-96a5-a6bb1b369704',
    'isFavorite': false,
    'offers': [
      '7d3e4894-1644-479c-a3e3-32866c59ed9a',
      '12aa7525-5575-4e36-9edd-1d608e147f9d',
      '729d2fbb-f1ec-4ca8-81e3-b014ec7e78d5',
      'e02a778f-26d3-4944-9a6c-bf1ceb4836ed'
    ],
    'type': 'check-in'
  },
  {
    'id': '8c7d75fb-8076-4758-aac3-d0d864678b89',
    'basePrice': 4906,
    'dateFrom': '2026-03-01T15:04:04.623Z',
    'dateTo': '2026-03-03T02:54:04.623Z',
    'destination': 'bb636a26-2be1-4fab-9b2b-24ec74e8e060',
    'isFavorite': false,
    'offers': [],
    'type': 'check-in'
  },
  {
    'id': '34b61b8f-b341-4e79-a2f5-7f0729cee130',
    'basePrice': 8952,
    'dateFrom': '2026-03-04T18:12:04.623Z',
    'dateTo': '2026-03-05T09:53:04.623Z',
    'destination': '2e2f0f11-85c5-418e-96a5-a6bb1b369704',
    'isFavorite': true,
    'offers': [],
    'type': 'ship'
  },
  {
    'id': 'dc744bb0-6a90-44d7-896f-804e8f37ea3b',
    'basePrice': 3539,
    'dateFrom': '2026-03-05T20:05:04.623Z',
    'dateTo': '2026-03-07T14:02:04.623Z',
    'destination': '5f5702eb-1c6c-4b42-842b-d7fc52c3b826',
    'isFavorite': true,
    'offers': [
      '57511301-4b22-40c9-b774-f8b5661e2783',
      'ca798ad7-3b55-4f8a-918c-44e45b499e6e',
      '92253a19-66d5-48d2-9cfc-94a87cf5baee',
      'f05d1b8c-90d9-433d-af97-1997f3f9a45a'
    ],
    'type': 'ship'
  },
  {
    'id': '3ddda924-7214-47b5-9543-1b30b8c4bfcb',
    'basePrice': 2194,
    'dateFrom': '2026-03-08T02:26:04.623Z',
    'dateTo': '2026-03-09T05:20:04.623Z',
    'destination': '5f5702eb-1c6c-4b42-842b-d7fc52c3b826',
    'isFavorite': true,
    'offers': [
      '12aa7525-5575-4e36-9edd-1d608e147f9d',
      '729d2fbb-f1ec-4ca8-81e3-b014ec7e78d5',
      'e02a778f-26d3-4944-9a6c-bf1ceb4836ed'
    ],
    'type': 'check-in'
  },
  {
    'id': '9246cafc-8164-4ef3-94e7-b0f7320024f3',
    'basePrice': 4130,
    'dateFrom': '2026-03-10T11:02:04.623Z',
    'dateTo': '2026-03-12T03:56:04.623Z',
    'destination': 'bb636a26-2be1-4fab-9b2b-24ec74e8e060',
    'isFavorite': false,
    'offers': [],
    'type': 'sightseeing'
  },
  {
    'id': '516dfee0-9008-448a-a4a7-2f4d5f53783e',
    'basePrice': 9890,
    'dateFrom': '2026-03-14T02:28:04.623Z',
    'dateTo': '2026-03-15T16:00:04.623Z',
    'destination': '0f265007-eb09-4edf-b70d-9b70ec609b62',
    'isFavorite': false,
    'offers': [],
    'type': 'sightseeing'
  },
  {
    'id': 'dce7510b-b43b-49f3-8dc5-f9529190f331',
    'basePrice': 1712,
    'dateFrom': '2026-03-17T04:35:04.623Z',
    'dateTo': '2026-03-18T23:26:04.623Z',
    'destination': 'bb001a1f-92e2-4bfa-853d-06607a3fb10e',
    'isFavorite': false,
    'offers': [
      '22bf25fd-fe4d-436c-b80d-a1eccac9bb99',
      '3376a9eb-e753-4b58-a0fa-a6d459b943b0'
    ],
    'type': 'drive'
  },
  {
    'id': '3d84ab80-047e-4649-8adc-27482f171e8a',
    'basePrice': 6659,
    'dateFrom': '2026-03-19T12:55:04.623Z',
    'dateTo': '2026-03-21T09:58:04.623Z',
    'destination': '5f5702eb-1c6c-4b42-842b-d7fc52c3b826',
    'isFavorite': true,
    'offers': [],
    'type': 'train'
  },
  {
    'id': '2728a5ef-ea26-4a92-b35b-07995f4c80b1',
    'basePrice': 7390,
    'dateFrom': '2026-03-23T03:06:04.623Z',
    'dateTo': '2026-03-24T04:50:04.623Z',
    'destination': '0f265007-eb09-4edf-b70d-9b70ec609b62',
    'isFavorite': false,
    'offers': [
      '22bf25fd-fe4d-436c-b80d-a1eccac9bb99',
      '3376a9eb-e753-4b58-a0fa-a6d459b943b0'
    ],
    'type': 'drive'
  },
  {
    'id': '0751d616-5170-42b0-898f-8fa90a6dba78',
    'basePrice': 8296,
    'dateFrom': '2026-03-24T20:39:04.623Z',
    'dateTo': '2026-03-26T06:15:04.623Z',
    'destination': '8f996d94-2d24-4f3a-babf-4437074783d8',
    'isFavorite': false,
    'offers': [
      '8d0e8349-eb79-4b1e-b5cf-e46ebf730d0a',
      'ce491cfd-bfe1-4ad3-86fe-de559eaa50ab'
    ],
    'type': 'bus'
  },
  {
    'id': 'e7730003-6595-499c-9b1a-e0ddfc81bf3b',
    'basePrice': 5405,
    'dateFrom': '2026-03-27T06:49:04.623Z',
    'dateTo': '2026-03-28T00:01:04.623Z',
    'destination': 'bb636a26-2be1-4fab-9b2b-24ec74e8e060',
    'isFavorite': true,
    'offers': [],
    'type': 'train'
  },
  {
    'id': '5b2f4c22-95ed-4777-bbc5-b980629319b4',
    'basePrice': 7599,
    'dateFrom': '2026-03-29T14:55:04.623Z',
    'dateTo': '2026-03-31T10:08:04.623Z',
    'destination': '8f996d94-2d24-4f3a-babf-4437074783d8',
    'isFavorite': true,
    'offers': [
      '3901fbaa-84af-4fbf-9aa1-a70788261ac9',
      'ee6c02ae-9421-41be-b060-bf4d3fffaa84',
      '4b57c3d7-e29b-4fcb-a487-a9dbbcc98ffb'
    ],
    'type': 'train'
  },
  {
    'id': '3443c4a4-eaea-4237-98d1-9a839cd0ad4f',
    'basePrice': 1000,
    'dateFrom': '2026-04-01T23:04:04.623Z',
    'dateTo': '2026-04-02T22:50:04.623Z',
    'destination': 'bb001a1f-92e2-4bfa-853d-06607a3fb10e',
    'isFavorite': false,
    'offers': [],
    'type': 'drive'
  },
  {
    'id': 'cb42dd4e-044d-4859-9c72-1cd731075c9a',
    'basePrice': 2689,
    'dateFrom': '2026-04-04T08:04:04.623Z',
    'dateTo': '2026-04-05T13:14:04.623Z',
    'destination': '3beadd0a-8f80-4b97-a20b-48895207371e',
    'isFavorite': true,
    'offers': [
      'ce491cfd-bfe1-4ad3-86fe-de559eaa50ab'
    ],
    'type': 'bus'
  },
  {
    'id': '79191af4-9056-4229-bde0-32d54ab5a57d',
    'basePrice': 9978,
    'dateFrom': '2026-04-06T04:22:04.623Z',
    'dateTo': '2026-04-06T18:08:04.623Z',
    'destination': 'bb001a1f-92e2-4bfa-853d-06607a3fb10e',
    'isFavorite': false,
    'offers': [
      '6cdda523-6d29-4138-8035-55fc8c9d3c6f',
      'bbb1b0a8-c87b-4590-8ab4-0709cabb463e',
      '71584e4d-8675-4dae-9cf1-6aadf3406953',
      'd143d3ce-fbe1-46ae-b9e7-39e6dd9e5fd0',
      '5252feb4-953a-4ba9-a80d-eae260eff033'
    ],
    'type': 'flight'
  },
  {
    'id': 'e899be7f-fc93-4dce-8b77-3e6e76dc0dea',
    'basePrice': 3969,
    'dateFrom': '2026-04-07T09:32:04.623Z',
    'dateTo': '2026-04-09T09:45:04.623Z',
    'destination': 'bb001a1f-92e2-4bfa-853d-06607a3fb10e',
    'isFavorite': false,
    'offers': [
      '8f7f0eaa-eee4-4b74-9a19-4fb3b685264f',
      '8d0e8349-eb79-4b1e-b5cf-e46ebf730d0a',
      'ce491cfd-bfe1-4ad3-86fe-de559eaa50ab'
    ],
    'type': 'bus'
  },
  {
    'id': '813b826a-9e2f-46f7-8a15-46d0ec911aac',
    'basePrice': 8025,
    'dateFrom': '2026-04-11T06:03:04.623Z',
    'dateTo': '2026-04-12T22:36:04.623Z',
    'destination': '0f265007-eb09-4edf-b70d-9b70ec609b62',
    'isFavorite': true,
    'offers': [
      '41bc9ff0-1d23-40ab-bb70-067960a76068',
      'd0940260-8377-411f-bc17-6bd0f8f30c5c',
      '57511301-4b22-40c9-b774-f8b5661e2783',
      'ca798ad7-3b55-4f8a-918c-44e45b499e6e',
      '92253a19-66d5-48d2-9cfc-94a87cf5baee',
      'f05d1b8c-90d9-433d-af97-1997f3f9a45a'
    ],
    'type': 'ship'
  },
  {
    'id': '3bab91f6-b8ee-461e-8593-2d23a2c8d281',
    'basePrice': 7714,
    'dateFrom': '2026-04-13T08:06:04.623Z',
    'dateTo': '2026-04-14T08:01:04.623Z',
    'destination': 'bb636a26-2be1-4fab-9b2b-24ec74e8e060',
    'isFavorite': false,
    'offers': [],
    'type': 'sightseeing'
  },
  {
    'id': '4fa66d55-278f-41ad-b63e-ef6af6262784',
    'basePrice': 3339,
    'dateFrom': '2026-04-16T01:02:04.623Z',
    'dateTo': '2026-04-16T13:43:04.623Z',
    'destination': '8f996d94-2d24-4f3a-babf-4437074783d8',
    'isFavorite': false,
    'offers': [
      'ee6c02ae-9421-41be-b060-bf4d3fffaa84',
      '4b57c3d7-e29b-4fcb-a487-a9dbbcc98ffb'
    ],
    'type': 'train'
  },
  {
    'id': 'b6b3d232-627b-41e6-8df2-56629f37b402',
    'basePrice': 1971,
    'dateFrom': '2026-04-16T23:21:04.623Z',
    'dateTo': '2026-04-17T05:45:04.623Z',
    'destination': '2e2f0f11-85c5-418e-96a5-a6bb1b369704',
    'isFavorite': true,
    'offers': [],
    'type': 'train'
  },
  {
    'id': '84054a83-060a-48e8-929f-4de8844f0b6b',
    'basePrice': 8561,
    'dateFrom': '2026-04-18T03:26:04.623Z',
    'dateTo': '2026-04-18T12:44:04.623Z',
    'destination': '5f5702eb-1c6c-4b42-842b-d7fc52c3b826',
    'isFavorite': false,
    'offers': [
      '729d2fbb-f1ec-4ca8-81e3-b014ec7e78d5',
      'e02a778f-26d3-4944-9a6c-bf1ceb4836ed'
    ],
    'type': 'check-in'
  }
];

export const getMockPoints = () => {
  const pointsCount = getRandomNumber(3, 6);
  return getRandomItems(rawPoints, pointsCount);
};
