import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { Booking } from '../types';
import { formatDuration, formatPrice } from './currency';

/**
 * Generates a real, downloadable, professionally formatted Intrega Wings E-Ticket PDF client-side.
 * STRICT RULE: Only callable for bookings whose status === 'CONFIRMED'.
 */
export async function generateETicketPdf(booking: Booking): Promise<void> {
  if (booking.status !== 'CONFIRMED') {
    throw new Error('E-Ticket generation is strictly locked until payment is verified.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const navy: [number, number, number] = [11, 31, 58]; // #0B1F3A
  const gold: [number, number, number] = [197, 160, 89]; // #C5A059
  const slateText: [number, number, number] = [30, 41, 59];
  const mutedText: [number, number, number] = [100, 116, 139];
  const emerald: [number, number, number] = [16, 130, 92];
  const lightSurface: [number, number, number] = [248, 250, 252];

  // Top Header Band
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold bottom accent rule on header
  doc.setFillColor(...gold);
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  // Vector Wing Emblem in header
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.9);
  doc.line(16, 17, 29, 13);
  doc.line(18, 21, 31, 17.5);
  doc.line(20, 25, 29, 22.5);

  // Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('INTREGA WINGS', 36, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(216, 183, 116);
  doc.text('INTERNATIONAL AIR AGENCY & OFFICIAL AIRLINE', 36, 26);

  // Right Header Document Label
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ELECTRONIC TICKET', pageWidth - 16, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`PNR / REF: ${booking.pnr}`, pageWidth - 16, 24, { align: 'right' });
  doc.text(`ISSUED: ${new Date(booking.payment.verifiedAt || booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - 16, 29.5, { align: 'right' });

  // Verified Status Banner
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(16, 51, pageWidth - 32, 14, 2, 2, 'FD');

  doc.setFillColor(...emerald);
  doc.circle(23, 58, 2.6, 'F');
  doc.setTextColor(...emerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PAYMENT VERIFIED  •  TICKET CONFIRMED', 29, 57);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text(
    `Method: ${booking.payment.method.replace('_', ' ')}  |  TxID: ${booking.payment.txId}  |  Total Paid: ${formatPrice(booking.totalPriceUsd, booking.currencyAtBooking)} (${booking.payment.cryptoAmount} ${booking.payment.cryptoSymbol})`,
    29,
    62
  );

  // Passenger & Booking Summary Card
  doc.setFillColor(...lightSurface);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, 72, pageWidth - 32, 34, 2, 2, 'FD');

  const drawField = (label: string, value: string, x: number, y: number, boldValue = true) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont('helvetica', boldValue ? 'bold' : 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(...slateText);
    doc.text(value, x, y + 5.5);
  };

  const fullName = `${booking.primaryPassenger.firstName} ${booking.primaryPassenger.lastName}`.toUpperCase();
  const totalPax = booking.passengers.adults + booking.passengers.children + booking.passengers.infants;

  drawField('Primary Passenger', fullName, 22, 80);
  drawField('Passport Number', booking.primaryPassenger.passportNumber.toUpperCase(), 96, 80);
  drawField('PNR Reference', booking.pnr, 152, 80);

  drawField('Cabin Class', booking.flight.cabinClass.toUpperCase(), 22, 95);
  drawField('Assigned Seat', booking.seatNumber, 96, 95);
  drawField('Travelers', `${totalPax} Passenger${totalPax > 1 ? 's' : ''} (${booking.tripType.replace('-', ' ')})`, 152, 95);

  // Flight Itinerary Section
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text('FLIGHT ITINERARY', 16, 118);

  if (booking.flight.isOfficialIntrega) {
    doc.setFillColor(...gold);
    doc.roundedRect(68, 113, 52, 6, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('OFFICIAL INTREGA WINGS FLIGHT', 94, 117, { align: 'center' });
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, 122, pageWidth - 32, 62, 2.5, 2.5, 'FD');

  // Airline bar inside itinerary
  doc.setFillColor(...navy);
  doc.rect(16, 122, pageWidth - 32, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`${booking.flight.airline}  —  Flight ${booking.flight.flightNumber}`, 22, 129);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(216, 183, 116);
  doc.text(`${booking.flight.aircraft}  •  ${booking.flight.stops === 0 ? 'Non-Stop' : `1 Stop (${booking.flight.stopoverCity})`}`, pageWidth - 22, 129, { align: 'right' });

  // Origin -> Destination Visual Block
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(booking.flight.origin.code, 22, 149);
  doc.text(booking.flight.destination.code, pageWidth - 22, 149, { align: 'right' });

  // Flight Path Connector
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.7);
  doc.line(54, 146, pageWidth - 54, 146);
  doc.setFillColor(...gold);
  doc.circle(54, 146, 1.4, 'F');
  doc.circle(pageWidth - 54, 146, 1.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text(formatDuration(booking.flight.durationMinutes), pageWidth / 2, 143, { align: 'center' });

  // City & Airport details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...slateText);
  doc.text(`${booking.flight.origin.city}, ${booking.flight.origin.country}`, 22, 156);
  doc.text(`${booking.flight.destination.city}, ${booking.flight.destination.country}`, pageWidth - 22, 156, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text(`${booking.flight.origin.name} (${booking.flight.terminalDep})`, 22, 161);
  doc.text(`${booking.flight.destination.name} (${booking.flight.terminalArr})`, pageWidth - 22, 161, { align: 'right' });

  // Departure & Arrival Times
  doc.setDrawColor(226, 232, 240);
  doc.line(22, 166, pageWidth - 22, 166);

  drawField('Departure Date & Time', `${booking.flight.departureDate}  at  ${booking.flight.departureTime}`, 22, 173);
  drawField(
    'Arrival Time',
    `${booking.flight.arrivalTime}${booking.flight.nextDayArrival ? ' (+1 Day)' : ''}`,
    96,
    173
  );
  drawField('Baggage Allowance', booking.flight.baggageAllowance, 142, 173, false);

  // Scannable QR Code & Boarding Verification Section
  const qrPayload = JSON.stringify({
    issuer: 'INTREGA_WINGS',
    pnr: booking.pnr,
    passenger: fullName,
    flight: booking.flight.flightNumber,
    route: `${booking.flight.origin.code}-${booking.flight.destination.code}`,
    date: booking.flight.departureDate,
    seat: booking.seatNumber,
    cabin: booking.flight.cabinClass,
    verifiedTx: booking.payment.txId,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 240,
    margin: 1,
    color: {
      dark: '#0B1F3A',
      light: '#FFFFFF',
    },
  });

  doc.setFillColor(...lightSurface);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(16, 194, pageWidth - 32, 54, 2.5, 2.5, 'FD');

  doc.addImage(qrDataUrl, 'PNG', 22, 200, 42, 42);

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text('BOARDING & SECURITY VERIFICATION', 72, 206);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateText);
  doc.text('Present this QR code and your valid passport at airport check-in and security.', 72, 213);
  doc.text(`Order Reference: ${booking.payment.orderReference}`, 72, 220);
  doc.text(`Webhook Confirmation ID: ${booking.payment.webhookEventId || 'WH-VERIFIED'}`, 72, 226);
  doc.text(`Contact Email: ${booking.primaryPassenger.email}`, 72, 232);

  // Simulated Visual Boarding Barcode Bars
  let barX = 72;
  const barSeed = booking.pnr + booking.flight.flightNumber;
  doc.setFillColor(...navy);
  for (let i = 0; i < 48; i++) {
    const code = barSeed.charCodeAt(i % barSeed.length);
    const width = (code + i) % 3 === 0 ? 1.1 : 0.55;
    doc.rect(barX, 236, width, 7, 'F');
    barX += width + 0.85;
  }

  // Footer Notices
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.4);
  doc.line(16, 264, pageWidth - 16, 264);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedText);
  doc.text(
    'Intrega Wings International Air Agency & Official Airline  •  24/7 Global Support: +41 44 580 92 00  •  concierge@intregawings.com',
    pageWidth / 2,
    271,
    { align: 'center' }
  );
  doc.text(
    'Check-in counters open 3 hours prior to international departure and close strictly 60 minutes before scheduled takeoff.',
    pageWidth / 2,
    276,
    { align: 'center' }
  );

  doc.save(`IntregaWings-ETicket-${booking.pnr}-${booking.flight.flightNumber}.pdf`);
}
