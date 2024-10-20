"""Add patient_name column to Invoice model

Revision ID: f81bd0b8d659
Revises: 
Create Date: 2024-10-10 21:40:47.630747

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f81bd0b8d659'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('invoice', schema=None) as batch_op:
        batch_op.add_column(sa.Column('patient_name', sa.String(length=100), nullable=False))
        batch_op.add_column(sa.Column('patient_email', sa.String(length=120), nullable=False))
        batch_op.add_column(sa.Column('patient_address', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('additional_notes', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('invoice', schema=None) as batch_op:
        batch_op.drop_column('additional_notes')
        batch_op.drop_column('patient_address')
        batch_op.drop_column('patient_email')
        batch_op.drop_column('patient_name')

    # ### end Alembic commands ###
