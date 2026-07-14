"""add extracted_text to application_documents

Revision ID: g1h2i3j4k5l6
Revises: e4b9c2f11a77
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g1h2i3j4k5l6'
down_revision: Union[str, None] = 'd9cbf9b10222'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('application_documents', sa.Column('extracted_text', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('application_documents', 'extracted_text')
