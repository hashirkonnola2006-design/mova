import torch
import torch.nn as nn

class ISLClassifier(nn.Module):
    """
    GRU-based classifier for 30-frame x 126-feature ISL sequences.
    Outputs logits for 21 classes (20 signs + idle).
    """
    def __init__(self, input_dim=126, hidden_dim=64, num_classes=21, num_layers=2, dropout=0.2):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.num_layers = num_layers

        self.gru = nn.GRU(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0
        )
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        # x shape: (batch_size, 30, 126)
        out, _ = self.gru(x)
        # Use final time-step embedding
        last_step = out[:, -1, :]
        logits = self.fc(last_step)
        return logits
