<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Votre Billet - KCTrip</title>
    <style>
        /* Reset styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Mobile styles */
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 0 !important; }
            .content { padding: 15px !important; }
            .button { 
                width: 90% !important; 
                display: block !important; 
                padding: 18px 20px !important; 
                font-size: 18px !important;
                margin: 20px auto !important;
            }
            .ticket-detail { font-size: 14px !important; padding: 10px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            .mobile-hide { display: none !important; }
            .mobile-full { width: 100% !important; display: block !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f7fa;">
    
    <!-- Main Container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa; padding: 20px 0;">
        <tr>
            <td align="center">
                
                <!-- Content Wrapper -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎫 Votre Billet</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">KCTrip - Voyagez en toute sérénité</p>
                        </td>
                    </tr>
                    
                    <!-- Success Banner -->
                    <tr>
                        <td class="content" style="padding: 30px;">
                            <div style="background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #4CAF50;">
                                <h2 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 24px;">✅ Réservation Confirmée!</h2>
                                <p style="margin: 0; color: #1b5e20; font-size: 16px; line-height: 1.5;">
                                    Merci d'avoir choisi KCTrip. Votre billet de bus est prêt et attaché à cet email.
                                </p>
                            </div>
                            
                            <!-- Ticket Details -->
                            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📋 Détails du Billet</h3>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Numéro de Billet:</strong><br>
                                            <span style="font-family: monospace; font-size: 16px; color: #333;">{{ $ticketNumber }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Passager:</strong><br>
                                            <span style="color: #333;">{{ $passengerFirstName }} {{ $passengerLastName }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Itinéraire:</strong><br>
                                            <span style="color: #333; font-size: 18px;">{{ $departure }} → {{ $destination }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Date & Heure:</strong><br>
                                            <span style="color: #333;">{{ \Carbon\Carbon::parse($departureDate)->format('d/m/Y') }} à {{ substr($departureTime, 0, 5) }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Agence de départ:</strong><br>
                                            <span style="color: #333;">{{ $departureAgency }} - {{ $departure }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                            <strong style="color: #667eea;">Numéro de Siège:</strong><br>
                                            <span style="color: #333; font-size: 20px; font-weight: bold;">{{ $seatNumber }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="ticket-detail" style="padding: 12px 0;">
                                            <strong style="color: #667eea;">Montant Payé:</strong><br>
                                            <span style="color: #4CAF50; font-size: 20px; font-weight: bold;">{{ number_format($amount, 0, ',', ' ') }} FCFA</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Download Button - MOBILE OPTIMIZED -->
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 15px 0; color: #666; font-size: 16px; font-weight: 500;">📱 Téléchargez votre billet PDF</p>
                                <a href="{{ $qrCodeUrl }}/pdf" class="button" style="
                                    display: inline-block;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: #ffffff;
                                    text-decoration: none;
                                    padding: 18px 40px;
                                    border-radius: 50px;
                                    font-size: 18px;
                                    font-weight: bold;
                                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                                    text-align: center;
                                    min-width: 250px;
                                ">
                                    📥 Télécharger le Billet
                                </a>
                                <p style="margin: 15px 0 0 0; color: #999; font-size: 13px;">
                                    Le PDF est également attaché à cet email
                                </p>
                            </div>
                            
                            <!-- Alternative Download Link for Mobile -->
                            <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">📱 Sur mobile?</p>
                                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px;">
                                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:
                                </p>
                                <div style="background-color: #ffffff; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; color: #667eea;">
                                    {{ $qrCodeUrl }}/pdf
                                </div>
                            </div>
                            
                            <!-- Important Information -->
                            <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px;">ℹ️ Informations Importantes</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #0d47a1; font-size: 14px; line-height: 1.8;">
                                    <li>Présentez-vous à l'agence 30 minutes avant le départ</li>
                                    <li>Ayez votre billet (PDF ou imprimé) et votre pièce d'identité</li>
                                    <li>Le numéro de siège est {{ $seatNumber }}</li>
                                    <li>Contact: +237 6XX XXX XXX</li>
                                </ul>
                            </div>
                            
                            <!-- QR Code Info -->
                            <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    🔍 Scannez le QR code sur votre billet PDF à l'agence
                                </p>
                            </div>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #2c3e50; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #ecf0f1; font-size: 16px; font-weight: bold;">
                                KCTrip - Votre Compagnon de Voyage
                            </p>
                            <p style="margin: 0; color: #bdc3c7; font-size: 13px; line-height: 1.6;">
                                © {{ date('Y') }} KCTrip. Tous droits réservés.<br>
                                Cameroun | Travel with Confidence
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
