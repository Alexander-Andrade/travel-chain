/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * ConfirmReservation transaction
 * @param {org.example.travelchain.ConfirmReservation} ConfirmReservation
 * @transaction
 */
async function confirmReservation(tx) {
  if(tx.reservation.status !== 'NEW') {
    throw new Error('Only NEW reservations could be confirmed');
  }

  tx.reservation.status = 'CONFIRMED'
  const reservationRegistry = await getAssetRegistry('org.example.travelchain.Reservation');
  await reservationRegistry.update(tx.reservation);
}

/**
 * CheckIn transaction
 * @param {org.example.travelchain.CheckIn} CheckIn
 * @transaction
 */

async function checkIn(tx) {
  if(tx.reservation.status !== 'CONFIRMED') {
    throw new Error('Only CONFIRMED reservations could be checked in');
  }

  tx.reservation.status = 'CHECKED_IN'
  const reservationRegistry = await getAssetRegistry('org.example.travelchain.Reservation');
  await reservationRegistry.update(tx.reservation);
}

/**
 * CheckOut transaction
 * @param {org.example.travelchain.CheckOut} CheckOut
 * @transaction
 */

async function checkOut(tx) {
  if(tx.reservation.status !== 'CHECKED_IN') {
    throw new Error('Only CHECKED_IN reservations could be checked out');
  }
  
  tx.reservation.status = 'CHECKED_OUT'
  const reservationRegistry = await getAssetRegistry('org.example.travelchain.Reservation');
  await reservationRegistry.update(tx.reservation);
}

/**
 * CancelReservation transaction
 * @param {org.example.travelchain.CancelReservation} CancelReservation
 * @transaction
 */

async function cancelReservation(tx) {
  if(tx.reservation.status === 'CONFIRMED'){
    tx.reservation.status = 'CANCELLED'
    const reservationRegistry = await getAssetRegistry('org.example.travelchain.Reservation');
    await reservationRegistry.update(tx.reservation);
  }else{
    throw new Error('Only CONFIRMED reservations could be cancelled');
  }
}

/**
 * ReservationPayment transaction
 * @param {org.example.travelchain.ReservationPayment} ReservationPayment
 * @transaction
 */

async function reservationPayment(tx) {
  if(tx.reservation.status !== 'CHECKED_OUT') {
    throw new Error('Payment could be processed only in CHECKED_OUT state')
  }

  const guest = tx.reservation.owner
  const host = tx.reservation.apartment.owner
  guest.account.balance -= tx.invoice
  host.account.balance += tx.invoice

  const hostRegistry = await getParticipantRegistry('org.example.travelchain.Host')
  const guestRegistry = await getParticipantRegistry('org.example.travelchain.Guest')
  await hostRegistry.update(host)
  await guestRegistry.update(guest)
}
