<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Compte Activé - Jadoo Travels</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #FA9C0F 0%, #D7573B 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .credentials-box {
            background: white;
            padding: 20px;
            border-left: 4px solid #FA9C0F;
            margin: 20px 0;
            border-radius: 5px;
        }
        .credential-item {
            margin: 10px 0;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        .credential-label {
            font-weight: bold;
            color: #152F37;
        }
        .credential-value {
            color: #FA9C0F;
            font-size: 18px;
            font-family: monospace;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: #FA9C0F;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        .warning {
            background: #FFF8E8;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Bienvenue chez Jadoo Travels !</h1>
        <p>Votre compte a été activé avec succès</p>
    </div>

    <div class="content">
        <p>Bonjour <strong>{{ $user->name }}</strong>,</p>

        <p>Félicitations ! Votre compte Jadoo Travels a été activé par notre équipe d'administration suite à votre réservation et paiement confirmé.</p>

        <div class="credentials-box">
            <h3 style="color: #152F37; margin-top: 0;">🔐 Vos Identifiants de Connexion</h3>
            
            <div class="credential-item">
                <div class="credential-label">Email :</div>
                <div class="credential-value">{{ $user->email }}</div>
            </div>

            <div class="credential-item">
                <div class="credential-label">Téléphone :</div>
                <div class="credential-value">{{ $user->phone }}</div>
            </div>
        </div>

        <div class="warning">
            <strong>⚠️ Important :</strong> Pour votre première connexion, veuillez créer un mot de passe sécurisé. Conservez ces informations en lieu sûr.
        </div>

        <p style="text-align: center;">
            <a href="{{ config('app.frontend_url') }}/login" class="button">Se Connecter Maintenant</a>
        </p>

        <h3 style="color: #152F37;">📱 Que pouvez-vous faire avec votre compte ?</h3>
        <ul>
            <li>✅ Consulter l'historique de vos réservations</li>
            <li>✅ Télécharger vos tickets à tout moment</li>
            <li>✅ Gérer vos informations personnelles</li>
            <li>✅ Réserver de nouveaux voyages plus rapidement</li>
            <li>✅ Suivre le statut de vos paiements</li>
        </ul>

        <h3 style="color: #152F37;">🎫 Rappel Important</h3>
        <p><strong>N'oubliez pas de télécharger votre ticket dans les 2 heures suivant le paiement.</strong> Après ce délai, un remboursement automatique sera effectué et votre siège sera libéré.</p>

        <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>

        <p style="margin-top: 30px;">
            Cordialement,<br>
            <strong style="color: #FA9C0F;">L'équipe Jadoo Travels</strong>
        </p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Jadoo Travels. Tous droits réservés.</p>
        <p>Cet email a été envoyé à {{ $user->email }}</p>
    </div>
</body>
</html>
